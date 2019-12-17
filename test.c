int minDistancia(int m, matriz distancia, matriz novisitado)
{
  int init;
  if(m==0)
    init = 1;
  else
    init = 0;
  int min = dist[m,init];
  int minindex = init;
  int v;
  for (v = 0; v < n; v++)
       if (novisitado[v] == 1 && dist[m, v] <= min && dist[m,v] != 0)
           min = dist[v];
           min_index = v;

   return min_index;
}
