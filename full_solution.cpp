#include<stdio.h>
#include<stdlib.h>
#include<string.h>
#include<limits.h>

typedef int VRType;
typedef char VertexType[20];
#define INFINITY INT_MAX
#define MAX_VERTEX_NUM 20
typedef enum{DG,DN,UDG,UDN}GraphKind;

typedef struct
{
    VRType adj;
}ArcCell,AdjMatrix[MAX_VERTEX_NUM][MAX_VERTEX_NUM];

typedef struct
{
    VertexType vexs[MAX_VERTEX_NUM];
    AdjMatrix arcs;
    int vexnum,arcnum;
    GraphKind kind;
}MGraph;

int LocateVex(MGraph G, VertexType u)
{
    for (int i = 0; i < G.vexnum; i++)
    {
        if (strcmp(G.vexs[i], u) == 0)
            return i;
    }
    return -1;
}

VertexType& GetVex(MGraph &G, int v)
{
    return G.vexs[v];
}

int FirstAdjVex(MGraph G, VertexType v)
{
    int i = LocateVex(G, v);
    if (i == -1) return -1;
    for (int j = 0; j < G.vexnum; j++)
    {
        if (G.arcs[i][j].adj != 0 && G.arcs[i][j].adj != INFINITY)
            return j;
    }
    return -1;
}

int NextAdjVex(MGraph G, VertexType v, VertexType w)
{
    int i = LocateVex(G, v);
    int j = LocateVex(G, w);
    if (i == -1 || j == -1) return -1;
    for (int k = j + 1; k < G.vexnum; k++)
    {
        if (G.arcs[i][k].adj != 0 && G.arcs[i][k].adj != INFINITY)
            return k;
    }
    return -1;
}

void DestroyGraph(MGraph &G)
{
    G.vexnum = 0;
    G.arcnum = 0;
}

void CreateGraphF(MGraph &G)
{
    int kind;
    scanf("%d", &kind);
    G.kind = (GraphKind)kind;
    char fn[256];
    scanf("%s", fn);
    FILE *fp = fopen(fn, "r");
    if (fp == NULL) return;
    fscanf(fp, "%d", &G.vexnum);
    fscanf(fp, "%d", &G.arcnum);
    for (int i = 0; i < G.vexnum; i++)
    {
        fscanf(fp, "%s", G.vexs[i]);
    }
    for (int i = 0; i < G.vexnum; i++)
    {
        for (int j = 0; j < G.vexnum; j++)
        {
            G.arcs[i][j].adj = INFINITY;
        }
    }
    char v1[20], v2[20];
    int w;
    for (int i = 0; i < G.arcnum; i++)
    {
        fscanf(fp, "%s %s %d", v1, v2, &w);
        int r = LocateVex(G, v1);
        int c = LocateVex(G, v2);
        if (r >= 0 && c >= 0)
        {
            G.arcs[r][c].adj = w;
            if (G.kind == UDN || G.kind == UDG)
            {
                G.arcs[c][r].adj = w;
            }
        }
    }
    fclose(fp);
}

void Display(MGraph G)
{
    switch (G.kind)
    {
        case DG:  printf("有向图\n");  break;
        case DN:  printf("有向网\n");  break;
        case UDG: printf("无向图\n"); break;
        case UDN: printf("无向网\n"); break;
    }
    printf("%d个顶点%d条边。顶点依次是: ", G.vexnum, G.arcnum);
    for (int i = 0; i < G.vexnum; i++)
    {
        printf("%s ", G.vexs[i]);
    }
    printf("\n");
    printf("图的邻接矩阵:\n");
    for (int i = 0; i < G.vexnum; i++)
    {
        for (int j = 0; j < G.vexnum; j++)
        {
            if (G.arcs[i][j].adj == INFINITY)
            {
                printf("∞    ");
            }
            else
            {
                printf("%-5d", G.arcs[i][j].adj);
            }
        }
        printf("\n");
    }
}

int main()
{
    MGraph g;
    VertexType v1,v2;
    CreateGraphF(g);
    Display(g);
    int i,j,k,n;
    scanf("%s",v1);
    for(k = FirstAdjVex(g, v1); k >= 0; k = NextAdjVex(g, v1, GetVex(g, k)))
    {
        printf("%s ",GetVex(g, k));
    }
    printf("\n");
    return 0;
}
