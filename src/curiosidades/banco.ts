export type CategoriaCuriosidade = 'História' | 'Ciência' | 'Arte' | 'Geografia'

export interface Curiosidade {
  categoria: CategoriaCuriosidade
  titulo: string
  /** uma linha, aparece no cartão da home */
  resumo: string
  /** texto completo, aparece na janela */
  texto: string
  fonte: string
}

const c = (
  categoria: CategoriaCuriosidade,
  titulo: string,
  resumo: string,
  texto: string,
  fonte: string,
): Curiosidade => ({ categoria, titulo, resumo, texto, fonte })

const HISTORIA: Curiosidade[] = [
  c(
    'História',
    'Cleópatra e a Lua',
    'Ela viveu mais perto da chegada à Lua do que da construção da Grande Pirâmide.',
    'Cleópatra nasceu por volta de 69 a.C. A Grande Pirâmide de Gizé foi erguida cerca de 2.500 anos antes disso. Já a chegada do homem à Lua, em 1969, aconteceu cerca de 2.000 anos depois dela. O tempo entre a pirâmide e Cleópatra é maior do que entre Cleópatra e a Apollo 11.',
    'Wikipédia',
  ),
  c(
    'História',
    'Oxford é mais velha que os astecas',
    'Já se ensinava em Oxford antes de existir a cidade de Tenochtitlán.',
    'Há registros de ensino na Universidade de Oxford desde cerca de 1096. A cidade asteca de Tenochtitlán, que hoje é a Cidade do México, só foi fundada por volta de 1325. A universidade já tinha séculos de aulas quando os astecas começaram a construir sua capital.',
    'Wikipédia',
  ),
  c(
    'História',
    'A guerra de 116 anos',
    'A "Guerra dos Cem Anos" durou, na verdade, 116 anos.',
    'O conflito entre Inglaterra e França começou em 1337 e só terminou em 1453. Não foi uma luta contínua: houve longas pausas, tréguas e fases bem diferentes. O nome "Guerra dos Cem Anos" foi dado por historiadores bem depois.',
    'Britannica',
  ),
  c(
    'História',
    'A guerra de 40 minutos',
    'A guerra mais curta da história acabou em menos de uma hora.',
    'Em 27 de agosto de 1896, a Inglaterra e o Sultanato de Zanzibar entraram em guerra. Os navios britânicos bombardearam o palácio e o sultão se rendeu em cerca de 40 minutos. É considerada a guerra mais curta já registrada.',
    'Britannica',
  ),
  c(
    'História',
    'Olimpíadas de mais de mil anos',
    'Os Jogos da Grécia Antiga aconteceram por cerca de 12 séculos.',
    'A tradição diz que os primeiros Jogos Olímpicos foram realizados em 776 a.C., em Olímpia. Eles continuaram a cada quatro anos até 393 d.C., quando o imperador romano Teodósio I os teria proibido. Depois ficaram quase 1.500 anos sem acontecer, até a volta em Atenas, em 1896.',
    'Britannica',
  ),
  c(
    'História',
    'A Muralha da China não aparece do espaço',
    'Mito antigo: a olho nu, ela não é visível da órbita.',
    'Astronautas relatam que a Grande Muralha não se destaca da órbita da Terra a olho nu. Ela é comprida, mas muito estreita, e tem cor parecida com a do terreno ao redor. Com lentes de aumento, ela pode ser vista em fotos tiradas do espaço.',
    'NASA',
  ),
  c(
    'História',
    'O último país a abolir a escravidão',
    'O Brasil foi o último país das Américas a acabar com a escravidão.',
    'A Lei Áurea, assinada pela princesa Isabel em 13 de maio de 1888, acabou com a escravidão no Brasil. Nenhum outro país das Américas manteve o sistema por tanto tempo. Cuba tinha abolido dois anos antes, em 1886.',
    'Senado Federal',
  ),
  c(
    'História',
    'Roma caiu, mas ainda restou Roma',
    'O Império Romano do Oriente durou quase mil anos depois da queda do Ocidente.',
    'O Império Romano do Ocidente caiu em 476. Já o Império Romano do Oriente, com capital em Constantinopla, sobreviveu até 1453, quando os otomanos tomaram a cidade. Foram quase mil anos a mais. Hoje esse império é chamado de Bizantino.',
    'Britannica',
  ),
  c(
    'História',
    'Machu Picchu e o mundo',
    'A cidadela inca ficou fora do mapa por séculos, até 1911.',
    'Machu Picchu foi construída por volta de 1450 e abandonada pouco depois da chegada dos espanhóis. Moradores da região conheciam o lugar, mas ele ficou ignorado pelo resto do mundo até 1911, quando o explorador Hiram Bingham chamou atenção internacional para ele.',
    'UNESCO',
  ),
  c(
    'História',
    'A febre das tulipas',
    'Na Holanda de 1637, um bulbo de tulipa chegou a custar mais que uma casa.',
    'No início do século XVII, tulipas raras viraram objeto de desejo na Holanda. Em 1637, o preço de alguns bulbos chegou ao valor de uma casa, até que o mercado desabou. É lembrado como uma das primeiras bolhas especulativas da história.',
    'Britannica',
  ),
  c(
    'História',
    'O dia que não existiu',
    'Em 1582, vários países pularam de 4 para 15 de outubro.',
    'Quando o papa Gregório XIII criou o calendário gregoriano, o calendário estava atrasado em cerca de 10 dias em relação às estações. Em 1582, os países católicos que o adotaram foram direto do dia 4 para o dia 15 de outubro. Para muita gente, aqueles 10 dias nunca existiram.',
    'Britannica',
  ),
  c(
    'História',
    'A faraó Hatshepsut',
    'Uma mulher reinou como faraó e depois quiseram apagar seu nome.',
    'Hatshepsut governou o Egito por volta de 1479 a 1458 a.C. e se apresentava com as vestes e a barba falsa dos faraós. Depois da sua morte, seu nome e imagens foram apagados de vários monumentos, provavelmente por ordem do sucessor. Só no século XIX os arqueólogos a redescobriram.',
    'Britannica',
  ),
]

const CIENCIA: Curiosidade[] = [
  c(
    'Ciência',
    'O mel não estraga',
    'Potes de mel de 3 mil anos achados no Egito ainda eram comestíveis.',
    'Arqueólogos encontraram potes de mel em tumbas egípcias com cerca de 3 mil anos, ainda próprios para consumo. O mel tem pouca água, é ácido e contém uma enzima das abelhas que produz peróxido de hidrogênio, o que impede o crescimento de bactérias.',
    'Smithsonian Magazine',
  ),
  c(
    'Ciência',
    'Polvos têm três corações',
    'E o sangue deles é azul.',
    'Dois dos corações do polvo levam o sangue às brânquias e o terceiro leva ao resto do corpo. O sangue é azul porque usa hemocianina, uma proteína com cobre, para transportar oxigênio em águas frias e pobres em oxigênio.',
    'National Geographic',
  ),
  c(
    'Ciência',
    'Em Vênus, o dia dura mais que o ano',
    'Ele gira tão devagar que um dia vale mais que uma volta ao redor do Sol.',
    'Vênus leva cerca de 243 dias terrestres para girar uma vez em torno de si mesmo e cerca de 225 dias para dar uma volta ao redor do Sol. Além disso, gira ao contrário da maioria dos planetas: lá o Sol nasce no oeste.',
    'NASA',
  ),
  c(
    'Ciência',
    'Bananas são levemente radioativas',
    'Culpa do potássio, que também está no seu corpo.',
    'As bananas são ricas em potássio, e uma pequena parte desse potássio é o isótopo potássio-40, naturalmente radioativo. A quantidade é tão pequena que não faz mal: você tem o mesmo tipo de átomo no próprio corpo.',
    'Britannica',
  ),
  c(
    'Ciência',
    'A luz do Sol é uma viagem de 8 minutos',
    'O Sol que você vê é o Sol de oito minutos atrás.',
    'A luz leva cerca de 8 minutos e 20 segundos para percorrer os cerca de 150 milhões de quilômetros entre o Sol e a Terra. Se o Sol desaparecesse de repente, continuaríamos a vê-lo e a sentir sua gravidade por mais ou menos esse tempo.',
    'NASA',
  ),
  c(
    'Ciência',
    'Dois metros de DNA em cada célula',
    'Esticado, o DNA de uma célula teria cerca de 2 metros.',
    'O DNA de uma única célula humana, se esticado, mediria cerca de 2 metros. Ele cabe dentro do núcleo porque fica enrolado e dobrado de forma muito compacta ao redor de proteínas.',
    'Genome.gov',
  ),
  c(
    'Ciência',
    'Tubarões são mais velhos que as árvores',
    'Eles já nadavam muito antes de existirem florestas.',
    'Os primeiros tubarões apareceram há cerca de 450 milhões de anos. As primeiras árvores de verdade só surgiram por volta de 350 a 385 milhões de anos atrás. Tubarões também são mais velhos que os dinossauros.',
    'Smithsonian Ocean',
  ),
  c(
    'Ciência',
    'Coalas e impressões digitais',
    'As digitais de coalas são muito parecidas com as humanas.',
    'Coalas, assim como os primatas, têm cristas e sulcos nas pontas dos dedos. Mesmo examinadas ao microscópio, elas são tão parecidas com as nossas que podem ser confundidas. É um exemplo de evolução convergente: espécies distantes desenvolvem a mesma característica.',
    'Wikipédia',
  ),
  c(
    'Ciência',
    'Uma colher de estrela de nêutrons',
    'Pesaria bilhões de toneladas.',
    'Estrelas de nêutrons são os restos de estrelas gigantes que explodiram. Elas concentram mais massa do que o Sol em uma bola de apenas cerca de 20 km de diâmetro. Por isso, uma colher de chá dessa matéria pesaria bilhões de toneladas.',
    'NASA',
  ),
  c(
    'Ciência',
    'Quase um parente: o chimpanzé',
    'Compartilhamos cerca de 98% do DNA com chimpanzés.',
    'Humanos e chimpanzés têm cerca de 98 a 99% do DNA em comum. Nossos caminhos evolutivos se separaram há uns 6 a 7 milhões de anos. A diferença está em como e quando os genes são ligados e desligados.',
    'Genome.gov',
  ),
  c(
    'Ciência',
    'A Torre Eiffel cresce no verão',
    'O calor dilata o ferro e ela fica até 15 cm mais alta.',
    'Com o calor, o ferro da Torre Eiffel se expande e a estrutura pode ficar até cerca de 15 cm mais alta no verão. No inverno, ela volta a encolher. É o efeito da dilatação térmica dos materiais.',
    'Tour Eiffel',
  ),
  c(
    'Ciência',
    'O som na água é mais rápido',
    'Ele viaja mais de quatro vezes mais rápido que no ar.',
    'No ar, o som viaja a cerca de 343 metros por segundo. Na água do mar, ele chega a cerca de 1.500 metros por segundo. Por isso baleias conseguem se comunicar a longas distâncias.',
    'NOAA',
  ),
  c(
    'Ciência',
    'O cérebro é um comilão',
    'Pesa cerca de 2% do corpo, mas gasta cerca de 20% da energia.',
    'O cérebro humano adulto pesa em torno de 1,4 kg, cerca de 2% da massa do corpo, mas consome mais ou menos 20% de toda a energia que usamos. Mesmo dormindo ele não descansa por completo.',
    'Scientific American',
  ),
  c(
    'Ciência',
    'Estrelas que já morreram',
    'Parte da luz que você vê no céu vem de estrelas que talvez nem existam mais.',
    'A luz das estrelas leva anos, séculos ou milênios para chegar até nós. Algumas das estrelas que vemos no céu podem já ter se apagado, e ainda estamos recebendo a luz que saiu delas há muito tempo. Olhar para o céu é olhar para o passado.',
    'NASA',
  ),
]

const ARTE: Curiosidade[] = [
  c(
    'Arte',
    'O roubo que fez a Mona Lisa famosa',
    'Em 1911, ela sumiu do Louvre e virou notícia no mundo todo.',
    'Em agosto de 1911, o italiano Vincenzo Peruggia, que trabalhara no Louvre, saiu do museu com a Mona Lisa embaixo do casaco. O quadro ficou desaparecido por mais de dois anos e foi recuperado em 1913, na Itália. Foi o escândalo que a transformou em obra conhecida no mundo todo.',
    'Louvre',
  ),
  c(
    'Arte',
    'Van Gogh quase não vendeu quadros',
    'Em vida, ele vendeu pouquíssimas obras.',
    'Vincent van Gogh pintou cerca de 900 quadros em pouco mais de uma década, mas, segundo os registros, vendeu pouquíssimos em vida. Ele morreu em 1890, aos 37 anos. A fama só chegou nas décadas seguintes.',
    'Museu Van Gogh',
  ),
  c(
    'Arte',
    'O Grito tem várias versões',
    'Edvard Munch pintou, desenhou e gravou a mesma cena mais de uma vez.',
    'O Grito, de Edvard Munch, existe em quatro versões principais, feitas entre 1893 e 1910, em tinta e em pastel, e também como litografia. Algumas foram roubadas e recuperadas ao longo dos anos.',
    'Museu Munch',
  ),
  c(
    'Arte',
    'Beethoven e o silêncio',
    'Ele compôs a Nona Sinfonia quase completamente surdo.',
    'Beethoven começou a perder a audição por volta dos 28 anos e, no fim da vida, estava praticamente surdo. Mesmo assim compôs a Nona Sinfonia, estreada em 1824. Dizem que no fim da apresentação ele precisou ser virado para ver o público aplaudindo.',
    'Britannica',
  ),
  c(
    'Arte',
    'Machado de Assis fundou a ABL',
    'O maior escritor brasileiro foi o primeiro presidente da Academia.',
    'Machado de Assis foi um dos fundadores da Academia Brasileira de Letras, criada em 1897, e foi seu primeiro presidente. Autor de Dom Casmurro e Memórias Póstumas de Brás Cubas, é considerado um dos maiores nomes da literatura em língua portuguesa.',
    'Academia Brasileira de Letras',
  ),
  c(
    'Arte',
    'Michelangelo pintou de pé',
    'A Capela Sistina não foi pintada deitado de costas.',
    'O mito diz que Michelangelo pintou o teto da Capela Sistina deitado. Na verdade, ele trabalhou de pé, sobre andaimes, com a cabeça inclinada para trás. O trabalho levou cerca de quatro anos, entre 1508 e 1512.',
    'Museus do Vaticano',
  ),
  c(
    'Arte',
    'O cinema que passou a falar',
    'O Cantor de Jazz, de 1927, abriu a era dos filmes sonoros.',
    'Até 1927, os filmes eram mudos e acompanhados de música ao vivo. O Cantor de Jazz foi o primeiro longa-metragem de grande sucesso com falas e canções sincronizadas, e em poucos anos os estúdios abandonaram o cinema mudo.',
    'Britannica',
  ),
  c(
    'Arte',
    'Frida e seus autorretratos',
    'Cerca de um terço de suas pinturas são ela mesma.',
    'Das cerca de 143 pinturas de Frida Kahlo, 55 são autorretratos. Ela dizia que se pintava porque passava muito tempo sozinha e era o assunto que melhor conhecia.',
    'Museu Frida Kahlo',
  ),
  c(
    'Arte',
    'Stradivarius: mais de 300 anos de som',
    'Muitos dos violinos de Antonio Stradivari ainda são tocados.',
    'Antonio Stradivari fez cerca de 1.100 instrumentos em Cremona, na Itália, entre os séculos XVII e XVIII, e pouco mais de 600 sobrevivem. Alguns violinos valem milhões de dólares e continuam sendo tocados em concertos.',
    'Smithsonian Magazine',
  ),
  c(
    'Arte',
    'Um quadro deu nome a um movimento',
    '"Impressão, nascer do sol", de Monet, batizou o Impressionismo.',
    'Em 1874, o crítico Louis Leroy visitou uma exposição de artistas rejeitados pelo Salão oficial de Paris e zombou do quadro de Claude Monet "Impressão, nascer do sol", pintado em 1872. A palavra "impressionistas" nasceu como piada, mas os artistas a adotaram.',
    'Museu d’Orsay',
  ),
  c(
    'Arte',
    'A Torre Eiffel quase foi desmontada',
    'Ela foi criada para durar 20 anos.',
    'Construída para a Exposição Universal de 1889, a Torre Eiffel tinha permissão para ficar de pé por 20 anos. Muitos artistas a criticaram. Ela foi salva porque se mostrou útil como antena de rádio e acabou virando o símbolo de Paris.',
    'Tour Eiffel',
  ),
]

const GEOGRAFIA: Curiosidade[] = [
  c(
    'Geografia',
    'Rússia: onze horários',
    'O país tem 11 fusos horários.',
    'A Rússia atravessa dois continentes e tem 11 fusos horários. Quando é manhã em Kaliningrado, já é fim de tarde na península de Kamchatka. Nenhum outro país tem tantos fusos horários em um só território contínuo.',
    'Britannica',
  ),
  c(
    'Geografia',
    'O maior deserto é de gelo',
    'A Antártida é um deserto, porque quase não chove nem neva por lá.',
    'Deserto não é sinônimo de calor, e sim de pouca precipitação. A Antártida recebe pouquíssima neve por ano em grande parte do continente, e por isso é o maior deserto do mundo, com cerca de 14 milhões de km².',
    'National Geographic',
  ),
  c(
    'Geografia',
    'O menor país do mundo',
    'O Vaticano cabe dentro de um parque.',
    'A Cidade do Vaticano tem cerca de 0,44 km², o menor país do mundo, menor que muitos parques. Fica dentro de Roma e tem menos de mil moradores.',
    'Britannica',
  ),
  c(
    'Geografia',
    'Um país, duas capitais',
    'A Bolívia tem La Paz e Sucre.',
    'Sucre é a capital constitucional da Bolívia e sede do Judiciário. La Paz é a sede do governo, do Legislativo e do Executivo. Por isso é comum dizer que o país tem duas capitais.',
    'Britannica',
  ),
  c(
    'Geografia',
    'O rio que enche o mar',
    'O Amazonas despeja cerca de um quinto da água doce que chega aos oceanos.',
    'O Rio Amazonas despeja, sozinho, cerca de 20% da água doce que os rios levam aos oceanos do planeta. Na foz, a água doce é tanta que pode ser identificada a quilômetros de distância no Atlântico.',
    'USGS',
  ),
  c(
    'Geografia',
    'Um país de 17 mil ilhas',
    'A Indonésia é o maior arquipélago do mundo.',
    'A Indonésia tem mais de 17 mil ilhas, das quais cerca de 6 mil são habitadas. Fica entre o Oceano Índico e o Pacífico e é o maior arquipélago do mundo.',
    'Britannica',
  ),
  c(
    'Geografia',
    'O Everest ainda está crescendo',
    'Cerca de 4 milímetros por ano.',
    'O Monte Everest sobe alguns milímetros por ano, porque a placa indiana continua empurrando a placa asiática. A montanha tem hoje cerca de 8.849 metros, segundo a medição oficial de 2020.',
    'National Geographic',
  ),
  c(
    'Geografia',
    'O ponto mais fundo',
    'A Fossa das Marianas tem cerca de 11 km de profundidade.',
    'No fundo do Pacífico, a Fossa das Marianas chega a cerca de 11 mil metros. Se o Monte Everest fosse colocado lá no fundo, o topo ainda ficaria a mais de 2 km da superfície.',
    'NOAA',
  ),
  c(
    'Geografia',
    'Maldivas: o país mais plano',
    'A altitude média é de cerca de 1,5 m acima do mar.',
    'As Maldivas são o país com a menor altitude média do planeta, cerca de 1,5 metro acima do nível do mar. Por isso o aumento do nível dos oceanos preocupa tanto o país.',
    'Britannica',
  ),
  c(
    'Geografia',
    'Istambul fica em dois continentes',
    'Metade na Europa, metade na Ásia.',
    'Istambul é cortada pelo estreito do Bósforo e fica nos dois lados dele: uma parte na Europa e a outra na Ásia. Por muitos séculos foi capital de impérios, com os nomes de Bizâncio, Constantinopla e hoje Istambul.',
    'Britannica',
  ),
  c(
    'Geografia',
    'Vizinhos do Brasil',
    'O Brasil faz fronteira com todos os países da América do Sul, menos dois.',
    'O Brasil faz fronteira com dez dos doze países da América do Sul. Os únicos que não têm fronteira com o Brasil são o Chile e o Equador.',
    'IBGE',
  ),
  c(
    'Geografia',
    'Baikal: o lago de 25 milhões de anos',
    'Guarda cerca de um quinto da água doce líquida da superfície do planeta.',
    'O Lago Baikal, na Sibéria, tem mais de 1.600 metros de profundidade e se formou há cerca de 25 milhões de anos. É o lago mais profundo e mais antigo do mundo e guarda por volta de 20% da água doce líquida da superfície da Terra.',
    'UNESCO',
  ),
  c(
    'Geografia',
    'Atacama: onde quase não chove',
    'Algumas áreas ficam anos sem receber uma gota.',
    'O Deserto do Atacama, no Chile, é um dos lugares mais secos do planeta. Em algumas estações meteorológicas houve anos inteiros sem chuva. Mesmo assim, de vez em quando o deserto floresce depois de chuvas raras.',
    'NASA',
  ),
]

// intercala as categorias para que dias seguidos tragam assuntos diferentes
function intercalar(listas: Curiosidade[][]): Curiosidade[] {
  const saida: Curiosidade[] = []
  const max = Math.max(...listas.map((l) => l.length))
  for (let i = 0; i < max; i++) for (const l of listas) if (i < l.length) saida.push(l[i])
  return saida
}

export const CURIOSIDADES: Curiosidade[] = intercalar([CIENCIA, HISTORIA, GEOGRAFIA, ARTE])
