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

// registra todos os componentes que vamos usar nos <Bar /> e <Pie />
ChartJS.register(
  CategoryScale,   // escala do eixo X
  LinearScale,     // escala do eixo Y
  BarElement,      // barras
  ArcElement,      // fatias de pizza
  PointElement,    // pontos de linha
  LineElement,     // linhas
  Title,           // título
  Tooltip,         // tooltip
  Legend           // legenda
);
