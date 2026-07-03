#include<stdio.h>
#include<stdlib.h>
#include<string.h>
#include<limits.h>

typedef int VRType;    // 顶点关系类型
typedef char VertexType[20]; // 顶点类型
// 图的数组(邻接矩阵)存储表示
#define INFINITY INT_MAX // 用整型最大值代替∞
#define MAX_VERTEX_NUM 20 // 最大顶点个数
typedef enum{DG,DN,UDG,UDN}GraphKind; // {有向图,有向网,无向图,无向网}

typedef struct
{
    VRType adj; // 顶点关系类型。对无权图，用1(是)或0(否)表示相邻否；对带权图，则为权值
}ArcCell,AdjMatrix[MAX_VERTEX_NUM][MAX_VERTEX_NUM]; // 二维数组

typedef struct      // 图的数组(邻接矩阵)存储
{
    VertexType vexs[MAX_VERTEX_NUM]; // 顶点向量
    AdjMatrix arcs; // 邻接矩阵
    int vexnum,arcnum; // 图的当前顶点数和弧数
    GraphKind kind; // 图的种类标志
}MGraph;

// 若G中存在顶点u，则返回该顶点在图中位置；否则返回-1
int LocateVex(MGraph G, VertexType u)
{
    for (int i = 0; i < G.vexnum; i++)
    {
        if (strcmp(G.vexs[i], u) == 0)
            return i;
    }
    return -1;
}

// v是G中某个顶点的序号，返回v的值
VertexType& GetVex(MGraph G, int v)
{
    return G.vexs[v];
}

// v是图G中某个顶点，返回v的第一个邻接顶点的序号。若顶点在G中没有邻接顶点，则返回-1
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

// v是G中某个顶点，w是v的邻接顶点，返回v的(相对于w的)下一个邻接顶点的序号，若w是v的最后一个邻接顶点，则返回-1
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

// 销毁图G
void DestroyGraph(MGraph &G)
{
    G.vexnum = 0;
    G.arcnum = 0;
}

// 采用数组(邻接矩阵)表示法，由文件构造无向网G
void CreateGraphF(MGraph &G)
{
    int kind;
    scanf("%d", &kind);
    G.kind = (GraphKind)kind;

    char filename[256];
    scanf("%s", filename);

    FILE *fp = fopen(filename, "r");
    if (fp == NULL) return;

    fscanf(fp, "%d", &G.vexnum);
    fscanf(fp, "%d", &G.arcnum);

    // 读入顶点
    for (int i = 0; i < G.vexnum; i++)
    {
        fscanf(fp, "%s", G.vexs[i]);
    }

    // 初始化邻接矩阵
    for (int i = 0; i < G.vexnum; i++)
    {
        for (int j = 0; j < G.vexnum; j++)
        {
            G.arcs[i][j].adj = INFINITY;
        }
    }

    // 读入边
    char v1[20], v2[20];
    int w;
    for (int i = 0; i < G.arcnum; i++)
    {
        fscanf(fp, "%s %s %d", v1, v2, &w);
        int row = LocateVex(G, v1);
        int col = LocateVex(G, v2);
        if (row != -1 && col != -1)
        {
            G.arcs[row][col].adj = w;
            // 无向图/网需对称赋值
            if (G.kind == UDN || G.kind == UDG)
            {
                G.arcs[col][row].adj = w;
            }
        }
    }

    fclose(fp);
}

// 输出邻接矩阵存储表示的图G
void Display(MGraph G)
{
    // 输出图的类型
    switch (G.kind)
    {
        case DG:  printf("有向图\n");  break;
        case DN:  printf("有向网\n");  break;
        case UDG: printf("无向图\n"); break;
        case UDN: printf("无向网\n"); break;
    }

    // 输出顶点和边数
    printf("%d个顶点%d条边。顶点依次是: ", G.vexnum, G.arcnum);
    for (int i = 0; i < G.vexnum; i++)
    {
        printf("%s ", G.vexs[i]);
    }
    printf("\n");

    // 输出邻接矩阵
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
