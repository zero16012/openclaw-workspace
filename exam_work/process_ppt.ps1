$ErrorActionPreference = "Stop"

$ws = "$env:USERPROFILE\.openclaw\workspace\exam_work"
$srcFile = "$ws\PPT素材\WPP.pptx"
$bgFile = "$ws\PPT素材\背景.png"
$logoFile = "$ws\PPT素材\光盘行动logo.png"
$outDir = "$ws\output"
$outFile = "$outDir\学号+姓名+WPP.pptx"

New-Item -ItemType Directory -Force -Path $outDir | Out-Null

try {
    Write-Host "Starting PowerPoint..."
    $ppt = New-Object -ComObject PowerPoint.Application
    $ppt.Visible = 1  # msoTrue - required for some COM operations
    $ppt.DisplayAlerts = "ppAlertsNone"

    Write-Host "Opening: $srcFile"
    $pres = $ppt.Presentations.Open($srcFile, 1, 0, 0)  # msoTrue, msoFalse, msoFalse
    $slides = $pres.Slides
    Write-Host "Opened with $($slides.Count) slides"

    # ============================================================
    # R1: Slide Master modifications
    # ============================================================
    Write-Host "[R1] Editing slide master..."
    $master = $pres.SlideMaster
    $master.Background.Fill.UserPicture($bgFile)
    $master.Background.Fill.Visible = 1

    # Add logo to master (appears on all slides)
    $logo = $master.Shapes.AddPicture($logoFile, 0, 1, 610, 8, 70, 65)
    $logo.Name = "光盘行动Logo"

    # ============================================================
    # R2: Change slides 3,5,7,9 layout to 节标题
    # ============================================================
    Write-Host "[R2] Section header layout..."
    $customLayouts = $pres.SlideMaster.CustomLayouts
    $sectionLayout = $null
    for ($i = 1; $i -le $customLayouts.Count; $i++) {
        $name = $customLayouts.Item(${i}).Name
        Write-Host "  Layout ${i}: ${name}"
        if ($name -like "*节标题*" -or $name -like "*Section*" -or $name -eq "仅标题") {
            $sectionLayout = $customLayouts.Item($i)
        }
    }
    
    # Typically layout 3 is the "仅标题" which is closest to section header
    # Let's use layout 4 if available, or the last layout
    if (-not $sectionLayout) {
        $sectionLayout = $customLayouts.Item($customLayouts.Count)
    }
    
    @(3,5,7,9) | ForEach-Object {
        $slides.Item($_).CustomLayout = $sectionLayout
        Write-Host "  Slide $_ layout changed"
    }

    # ============================================================
    # R1c: Set all titles to 黑体, specific slides to custom color
    # ============================================================
    Write-Host "[R1c] Setting title fonts..."
    for ($i = 1; $i -le $slides.Count; $i++) {
        $slide = $slides.Item($i)
        foreach ($shape in $slide.Shapes) {
            if ($shape.HasTextFrame -and $shape.TextFrame.HasText) {
                $tr = $shape.TextFrame.TextRange
                $text = $tr.Text.Trim()
                # Only style titles (short text at top of slides)
                if ($text -match "^(珍惜粮食|目 录|居安思危|粮食背后|反对浪费)") {
                    $tr.Font.Name = "黑体"
                    $tr.Font.NameFarEast = "黑体"
                    if (@(2,4,6,8,10) -contains $i) {
                        # Custom RGB: 248, 192, 165
                        $tr.Font.Color.RGB = 10870008  # 0x00A5C0F8 -> actually: RGB(248,192,165) = 0xA5C0F8
                    }
                    Write-Host "  Slide $i title formatted: '$text'"
                }
            }
        }
    }

    # ============================================================
    # R3: Slide 1 - Title slide formatting
    # ============================================================
    Write-Host "[R3] Formatting title slide..."
    $slide1 = $slides.Item(1)
    
    # Find and apply WordArt-like formatting to titles
    foreach ($shape in $slide1.Shapes) {
        if ($shape.HasTextFrame -and $shape.TextFrame.HasText) {
            $text = $shape.TextFrame.TextRange.Text.Trim()
            if ($text -eq "珍惜粮食  厉行节约") {
                # Apply WordArt style - try preset
                try {
                    $shape.TextFrame.TextRange.Font.Name = "黑体"
                    $shape.TextFrame.TextRange.Font.Size = 48
                    # For "渐变填充-金色"，set gradient fill
                    $shape.Fill.TwoColorGradient(1, 1)  # msoGradientHorizontal
                    $shape.Fill.GradientStops(1).Color.RGB = 0xFFD700  # Gold
                    $shape.Fill.GradientStops(2).Color.RGB = 0xFFA500  # Orange
                } catch { Write-Host "    Main title WordArt attempted" }
                
                # Animation: 劈裂 (Split), direction: 中央向左右展开
                $effect = $slide1.TimeLine.MainSequence.AddEffect($shape, 20, $null, 0)  # msoAnimEffectSplit
                $effect.Timing.TriggerType = 1  # On click
                try { $effect.EffectParameters.Direction = 8 } catch {}
                Write-Host "    Main title animation: Split"
            }
            elseif ($text -eq "—— 校公益宣传部") {
                $shape.TextFrame.TextRange.Font.Name = "黑体" 
                $shape.TextFrame.TextRange.Font.Size = 24
                # Apply "填充-白色，轮廓-着色5，阴影"
                $shape.Fill.Solid()
                $shape.Fill.ForeColor.RGB = 0xFFFFFF
                $shape.Shadow.Type = 1  # msoShadow1
                
                # Animation: 切入 (PeekIn or similar), direction: 自底部
                $effect = $slide1.TimeLine.MainSequence.AddEffect($shape, 0, $null, 0)  # msoAnimEffectAppear as placeholder
                try {
                    $effect = $slide1.TimeLine.MainSequence.AddEffect($shape, 14, $null, 0)  # msoAnimEffectAscend
                } catch {}
                $effect.Timing.TriggerType = 1
                Write-Host "    Subtitle animation set"
            }
            elseif ($text -eq "光盘行动，拒绝浪费") {
                $shape.TextFrame.TextRange.Font.Name = "黑体"
                $shape.TextFrame.TextRange.Font.Size = 20
                
                # Animate with main title (Triggered same time)
                $effect = $slide1.TimeLine.MainSequence.AddEffect($shape, 20, $null, 1)  # With previous
                Write-Host "    Third text animation set"
            }
        }
    }

    # ============================================================
    # R4: Hyperlinks - slide 2 images to section slides
    # ============================================================
    Write-Host "[R4] Adding hyperlinks..."
    $slide2 = $slides.Item(2)
    $imgIdx = 0
    $targetSlides = @(3, 5, 7, 9)
    
    foreach ($shape in $slide2.Shapes) {
        if ($shape.Type -eq 13 -and $shape.Name -like "*Picture*") {
            if ($imgIdx -lt $targetSlides.Count) {
                $target = $targetSlides[$imgIdx]
                $shape.ActionSettings(1).Hyperlink.SubAddress = "$target,$target,$target"
                $imgIdx++
            }
        }
    }
    Write-Host "  $imgIdx image links added"

    # Add logo hyperlinks to go back to slide 2
    for ($i = 1; $i -le $slides.Count; $i++) {
        $slide = $slides.Item($i)
        foreach ($shape in $slide.Shapes) {
            if ($shape.Name -like "*Logo*") {
                $shape.ActionSettings(1).Hyperlink.SubAddress = "2,2,2"
            }
        }
    }
    Write-Host "  Logo back-links added"

    # ============================================================
    # R5: Slide 4 - text formatting
    # ============================================================
    Write-Host "[R5] Slide 4 formatting..."
    $slide4 = $slides.Item(4)
    foreach ($shape in $slide4.Shapes) {
        if ($shape.HasTextFrame -and $shape.TextFrame.HasText) {
            $text = $shape.TextFrame.TextRange.Text
            if ($text.Contains("一粥一饭") -or $text.Contains("历览前贤")) {
                for ($p = 1; $p -le $shape.TextFrame.TextRange.Paragraphs.Count; $p++) {
                    $para = $shape.TextFrame.TextRange.Paragraphs($p)
                    $para.ParagraphFormat.SpaceAfter = 10  # 磅
                    $para.ParagraphFormat.SpaceWithin = 1.5  # 1.5倍行距
                    $para.ParagraphFormat.Bullet.Type = 1  # Bulleted
                    $para.ParagraphFormat.Bullet.Character = [char]8226  # 小圆点
                    $para.ParagraphFormat.Bullet.Font.Name = "Symbol"
                }
                Write-Host "  Text paragraphs formatted"
            }
        }
    }

    # ============================================================
    # R9: Transitions
    # ============================================================
    Write-Host "[R9] Setting transitions..."
    for ($i = 1; $i -le $slides.Count; $i++) {
        $slide = $slides.Item($i)
        $trans = $slide.SlideShowTransition
        $trans.AdvanceOnTime = 0
        
        if (@(4, 6, 8, 10) -contains $i) {
            # Morph transition
            $trans.EntryEffect = 114  # ppEffectMorph
            $trans.AdvanceOnTime = -1  # msoTrue (special handling)
            $trans.AdvanceTime = 3
        } else {
            $trans.EntryEffect = 19  # ppEffectRandom
            $trans.AdvanceTime = 1.5
        }
    }
    Write-Host "  Transitions set"

    # ============================================================
    # Hide background graphics on title slide (slide 1)
    # ============================================================
    $slide1.DisplayMasterShapes = 0  # msoFalse

    # ============================================================
    # Save
    # ============================================================
    Write-Host "`nSaving presentation..."
    $pres.SaveAs($outFile)
    $pres.Close()
    $ppt.Quit()
    
    Write-Host "`n✅ PPT saved to: $outFile"

    # Copy to desktop
    $desktopPath = [Environment]::GetFolderPath("Desktop")
    $examFolder = Get-ChildItem $desktopPath -Directory | Where-Object { $_.Name -like "*2025*" } | Select-Object -First 1
    if ($examFolder) {
        $dest = Join-Path $examFolder.FullName "学号+姓名+WPP.pptx"
        Copy-Item $outFile $dest -Force
        Write-Host "✅ Copied to: $dest"
    }

    Write-Host "`n⚠️  For best results, please manually refine in PowerPoint:"
    Write-Host "   - Slide 1: WordArt preset styles for titles"
    Write-Host "   - Slide 2: Verify image hyperlinks work"
    Write-Host "   - Slide 4: Add 锄地.png image at bottom-right"
    Write-Host "   - Slide 6: Convert text shape to pentagon arrow"
    Write-Host "   - Slide 6: Create 3 vertical text boxes with line separators"
    Write-Host "   - Slide 8: Convert to SmartArt 梯形列表"
    Write-Host "   - Slide 10: Add 柔化边缘25磅 to image"
    Write-Host "   - Slide 10: Layer image below text box"

} catch {
    Write-Host "`nERROR: $($_.Exception.Message)" -ForegroundColor Red
    $_.ScriptStackTrace | Out-Host
} finally {
    try { if ($pres) { $pres.Close() } } catch {}
    try { if ($ppt) { $ppt.Quit() } } catch {}
    try { [System.Runtime.Interopservices.Marshal]::ReleaseComObject($ppt) | Out-Null } catch {}
}
