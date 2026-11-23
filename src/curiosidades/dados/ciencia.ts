import type { Curiosidade } from '../banco'
import { em } from './fabrica'

const c = em('Ciência')

export const CIENCIA: Curiosidade[] = [
  c(
    'O mel não estraga',
    'Potes de mel de 3 mil anos achados no Egito ainda eram comestíveis.',
    'Arqueólogos encontraram potes de mel em tumbas egípcias com cerca de 3 mil anos, ainda próprios para consumo. O mel tem pouca água, é ácido e contém uma enzima das abelhas que produz peróxido de hidrogênio, o que impede o crescimento de bactérias.',
    'Smithsonian Magazine',
  ),
  c(
    'Polvos têm três corações',
    'E o sangue deles é azul.',
    'Dois dos corações do polvo levam o sangue às brânquias e o terceiro leva ao resto do corpo. O sangue é azul porque usa hemocianina, uma proteína com cobre, para transportar oxigênio em águas frias e pobres em oxigênio.',
    'National Geographic',
  ),
  c(
    'Em Vênus, o dia dura mais que o ano',
    'Ele gira tão devagar que um dia vale mais que uma volta ao redor do Sol.',
    'Vênus leva cerca de 243 dias terrestres para girar uma vez em torno de si mesmo e cerca de 225 dias para dar uma volta ao redor do Sol. Além disso, gira ao contrário da maioria dos planetas: lá o Sol nasce no oeste.',
    'NASA',
  ),
  c(
    'Bananas são levemente radioativas',
    'Culpa do potássio, que também está no seu corpo.',
    'As bananas são ricas em potássio, e uma pequena parte desse potássio é o isótopo potássio-40, naturalmente radioativo. A quantidade é tão pequena que não faz mal: você tem o mesmo tipo de átomo no próprio corpo.',
    'Britannica',
  ),
  c(
    'A luz do Sol é uma viagem de 8 minutos',
    'O Sol que você vê é o Sol de oito minutos atrás.',
    'A luz leva cerca de 8 minutos e 20 segundos para percorrer os cerca de 150 milhões de quilômetros entre o Sol e a Terra. Se o Sol desaparecesse de repente, continuaríamos a vê-lo e a sentir sua gravidade por mais ou menos esse tempo.',
    'NASA',
  ),
  c(
    'Dois metros de DNA em cada célula',
    'Esticado, o DNA de uma célula teria cerca de 2 metros.',
    'O DNA de uma única célula humana, se esticado, mediria cerca de 2 metros. Ele cabe dentro do núcleo porque fica enrolado e dobrado de forma muito compacta ao redor de proteínas.',
    'Genome.gov',
  ),
  c(
    'Tubarões são mais velhos que as árvores',
    'Eles já nadavam muito antes de existirem florestas.',
    'Os primeiros tubarões apareceram há cerca de 450 milhões de anos. As primeiras árvores de verdade só surgiram por volta de 350 a 385 milhões de anos atrás. Tubarões também são mais velhos que os dinossauros.',
    'Smithsonian Ocean',
  ),
  c(
    'Coalas e impressões digitais',
    'As digitais de coalas são muito parecidas com as humanas.',
    'Coalas, assim como os primatas, têm cristas e sulcos nas pontas dos dedos. Mesmo examinadas ao microscópio, elas são tão parecidas com as nossas que podem ser confundidas. É um exemplo de evolução convergente: espécies distantes desenvolvem a mesma característica.',
    'Wikipédia',
  ),
  c(
    'Uma colher de estrela de nêutrons',
    'Pesaria bilhões de toneladas.',
    'Estrelas de nêutrons são os restos de estrelas gigantes que explodiram. Elas concentram mais massa do que o Sol em uma bola de apenas cerca de 20 km de diâmetro. Por isso, uma colher de chá dessa matéria pesaria bilhões de toneladas.',
    'NASA',
  ),
  c(
    'Quase um parente: o chimpanzé',
    'Compartilhamos cerca de 98% do DNA com chimpanzés.',
    'Humanos e chimpanzés têm cerca de 98 a 99% do DNA em comum. Nossos caminhos evolutivos se separaram há uns 6 a 7 milhões de anos. A diferença está em como e quando os genes são ligados e desligados.',
    'Genome.gov',
  ),
  c(
    'A Torre Eiffel cresce no verão',
    'O calor dilata o ferro e ela fica até 15 cm mais alta.',
    'Com o calor, o ferro da Torre Eiffel se expande e a estrutura pode ficar até cerca de 15 cm mais alta no verão. No inverno, ela volta a encolher. É o efeito da dilatação térmica dos materiais.',
    'Tour Eiffel',
  ),
  c(
    'O som na água é mais rápido',
    'Ele viaja mais de quatro vezes mais rápido que no ar.',
    'No ar, o som viaja a cerca de 343 metros por segundo. Na água do mar, ele chega a cerca de 1.500 metros por segundo. Por isso baleias conseguem se comunicar a longas distâncias.',
    'NOAA',
  ),
  c(
    'O cérebro é um comilão',
    'Pesa cerca de 2% do corpo, mas gasta cerca de 20% da energia.',
    'O cérebro humano adulto pesa em torno de 1,4 kg, cerca de 2% da massa do corpo, mas consome mais ou menos 20% de toda a energia que usamos. Mesmo dormindo ele não descansa por completo.',
    'Scientific American',
  ),
  c(
    'Estrelas que já morreram',
    'Parte da luz que você vê no céu vem de estrelas que talvez nem existam mais.',
    'A luz das estrelas leva anos, séculos ou milênios para chegar até nós. Algumas das estrelas que vemos no céu podem já ter se apagado, e ainda estamos recebendo a luz que saiu delas há muito tempo. Olhar para o céu é olhar para o passado.',
    'NASA',
  ),
]
