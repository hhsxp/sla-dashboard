// src/chartjs.ts
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,    // eixo X para barras/linhas
  LinearScale,      // eixo Y
  BarElement,       // elementos de barras
  ArcElement,       // elementos de pizza (Pie)
  PointElement,     // pontos em linha
  LineElement,      // linhas
  Title,            // título
  Tooltip,          // tooltip
  Legend            // legenda
);
