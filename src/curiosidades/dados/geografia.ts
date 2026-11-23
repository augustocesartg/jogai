import type { Curiosidade } from '../banco'
import { em } from './fabrica'

const c = em('Geografia')

export const GEOGRAFIA: Curiosidade[] = [
  c(
    'Rússia: onze horários',
    'O país tem 11 fusos horários.',
    'A Rússia atravessa dois continentes e tem 11 fusos horários. Quando é manhã em Kaliningrado, já é fim de tarde na península de Kamchatka. Nenhum outro país tem tantos fusos horários em um só território contínuo.',
    'Britannica',
  ),
  c(
    'O maior deserto é de gelo',
    'A Antártida é um deserto, porque quase não chove nem neva por lá.',
    'Deserto não é sinônimo de calor, e sim de pouca precipitação. A Antártida recebe pouquíssima neve por ano em grande parte do continente, e por isso é o maior deserto do mundo, com cerca de 14 milhões de km².',
    'National Geographic',
  ),
  c(
    'O menor país do mundo',
    'O Vaticano cabe dentro de um parque.',
    'A Cidade do Vaticano tem cerca de 0,44 km², o menor país do mundo, menor que muitos parques. Fica dentro de Roma e tem menos de mil moradores.',
    'Britannica',
  ),
  c(
    'Um país, duas capitais',
    'A Bolívia tem La Paz e Sucre.',
    'Sucre é a capital constitucional da Bolívia e sede do Judiciário. La Paz é a sede do governo, do Legislativo e do Executivo. Por isso é comum dizer que o país tem duas capitais.',
    'Britannica',
  ),
  c(
    'O rio que enche o mar',
    'O Amazonas despeja cerca de um quinto da água doce que chega aos oceanos.',
    'O Rio Amazonas despeja, sozinho, cerca de 20% da água doce que os rios levam aos oceanos do planeta. Na foz, a água doce é tanta que pode ser identificada a quilômetros de distância no Atlântico.',
    'USGS',
  ),
  c(
    'Um país de 17 mil ilhas',
    'A Indonésia é o maior arquipélago do mundo.',
    'A Indonésia tem mais de 17 mil ilhas, das quais cerca de 6 mil são habitadas. Fica entre o Oceano Índico e o Pacífico e é o maior arquipélago do mundo.',
    'Britannica',
  ),
  c(
    'O Everest ainda está crescendo',
    'Cerca de 4 milímetros por ano.',
    'O Monte Everest sobe alguns milímetros por ano, porque a placa indiana continua empurrando a placa asiática. A montanha tem hoje cerca de 8.849 metros, segundo a medição oficial de 2020.',
    'National Geographic',
  ),
  c(
    'O ponto mais fundo',
    'A Fossa das Marianas tem cerca de 11 km de profundidade.',
    'No fundo do Pacífico, a Fossa das Marianas chega a cerca de 11 mil metros. Se o Monte Everest fosse colocado lá no fundo, o topo ainda ficaria a mais de 2 km da superfície.',
    'NOAA',
  ),
  c(
    'Maldivas: o país mais plano',
    'A altitude média é de cerca de 1,5 m acima do mar.',
    'As Maldivas são o país com a menor altitude média do planeta, cerca de 1,5 metro acima do nível do mar. Por isso o aumento do nível dos oceanos preocupa tanto o país.',
    'Britannica',
  ),
  c(
    'Istambul fica em dois continentes',
    'Metade na Europa, metade na Ásia.',
    'Istambul é cortada pelo estreito do Bósforo e fica nos dois lados dele: uma parte na Europa e a outra na Ásia. Por muitos séculos foi capital de impérios, com os nomes de Bizâncio, Constantinopla e hoje Istambul.',
    'Britannica',
  ),
  c(
    'Vizinhos do Brasil',
    'O Brasil faz fronteira com todos os países da América do Sul, menos dois.',
    'O Brasil faz fronteira com dez dos doze países da América do Sul. Os únicos que não têm fronteira com o Brasil são o Chile e o Equador.',
    'IBGE',
  ),
  c(
    'Baikal: o lago de 25 milhões de anos',
    'Guarda cerca de um quinto da água doce líquida da superfície do planeta.',
    'O Lago Baikal, na Sibéria, tem mais de 1.600 metros de profundidade e se formou há cerca de 25 milhões de anos. É o lago mais profundo e mais antigo do mundo e guarda por volta de 20% da água doce líquida da superfície da Terra.',
    'UNESCO',
  ),
  c(
    'Atacama: onde quase não chove',
    'Algumas áreas ficam anos sem receber uma gota.',
    'O Deserto do Atacama, no Chile, é um dos lugares mais secos do planeta. Em algumas estações meteorológicas houve anos inteiros sem chuva. Mesmo assim, de vez em quando o deserto floresce depois de chuvas raras.',
    'NASA',
  ),
]
