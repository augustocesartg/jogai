import type { Curiosidade } from '../banco'
import { em } from './fabrica'

const c = em('Arte')

export const ARTE: Curiosidade[] = [
  c(
    'O roubo que fez a Mona Lisa famosa',
    'Em 1911, ela sumiu do Louvre e virou notícia no mundo todo.',
    'Em agosto de 1911, o italiano Vincenzo Peruggia, que trabalhara no Louvre, saiu do museu com a Mona Lisa embaixo do casaco. O quadro ficou desaparecido por mais de dois anos e foi recuperado em 1913, na Itália. Foi o escândalo que a transformou em obra conhecida no mundo todo.',
    'Louvre',
  ),
  c(
    'Van Gogh quase não vendeu quadros',
    'Em vida, ele vendeu pouquíssimas obras.',
    'Vincent van Gogh pintou cerca de 900 quadros em pouco mais de uma década, mas, segundo os registros, vendeu pouquíssimos em vida. Ele morreu em 1890, aos 37 anos. A fama só chegou nas décadas seguintes.',
    'Museu Van Gogh',
  ),
  c(
    'O Grito tem várias versões',
    'Edvard Munch pintou, desenhou e gravou a mesma cena mais de uma vez.',
    'O Grito, de Edvard Munch, existe em quatro versões principais, feitas entre 1893 e 1910, em tinta e em pastel, e também como litografia. Algumas foram roubadas e recuperadas ao longo dos anos.',
    'Museu Munch',
  ),
  c(
    'Beethoven e o silêncio',
    'Ele compôs a Nona Sinfonia quase completamente surdo.',
    'Beethoven começou a perder a audição por volta dos 28 anos e, no fim da vida, estava praticamente surdo. Mesmo assim compôs a Nona Sinfonia, estreada em 1824. Dizem que no fim da apresentação ele precisou ser virado para ver o público aplaudindo.',
    'Britannica',
  ),
  c(
    'Machado de Assis fundou a ABL',
    'O maior escritor brasileiro foi o primeiro presidente da Academia.',
    'Machado de Assis foi um dos fundadores da Academia Brasileira de Letras, criada em 1897, e foi seu primeiro presidente. Autor de Dom Casmurro e Memórias Póstumas de Brás Cubas, é considerado um dos maiores nomes da literatura em língua portuguesa.',
    'Academia Brasileira de Letras',
  ),
  c(
    'Michelangelo pintou de pé',
    'A Capela Sistina não foi pintada deitado de costas.',
    'O mito diz que Michelangelo pintou o teto da Capela Sistina deitado. Na verdade, ele trabalhou de pé, sobre andaimes, com a cabeça inclinada para trás. O trabalho levou cerca de quatro anos, entre 1508 e 1512.',
    'Museus do Vaticano',
  ),
  c(
    'O cinema que passou a falar',
    'O Cantor de Jazz, de 1927, abriu a era dos filmes sonoros.',
    'Até 1927, os filmes eram mudos e acompanhados de música ao vivo. O Cantor de Jazz foi o primeiro longa-metragem de grande sucesso com falas e canções sincronizadas, e em poucos anos os estúdios abandonaram o cinema mudo.',
    'Britannica',
  ),
  c(
    'Frida e seus autorretratos',
    'Cerca de um terço de suas pinturas são ela mesma.',
    'Das cerca de 143 pinturas de Frida Kahlo, 55 são autorretratos. Ela dizia que se pintava porque passava muito tempo sozinha e era o assunto que melhor conhecia.',
    'Museu Frida Kahlo',
  ),
  c(
    'Stradivarius: mais de 300 anos de som',
    'Muitos dos violinos de Antonio Stradivari ainda são tocados.',
    'Antonio Stradivari fez cerca de 1.100 instrumentos em Cremona, na Itália, entre os séculos XVII e XVIII, e pouco mais de 600 sobrevivem. Alguns violinos valem milhões de dólares e continuam sendo tocados em concertos.',
    'Smithsonian Magazine',
  ),
  c(
    'Um quadro deu nome a um movimento',
    '"Impressão, nascer do sol", de Monet, batizou o Impressionismo.',
    'Em 1874, o crítico Louis Leroy visitou uma exposição de artistas rejeitados pelo Salão oficial de Paris e zombou do quadro de Claude Monet "Impressão, nascer do sol", pintado em 1872. A palavra "impressionistas" nasceu como piada, mas os artistas a adotaram.',
    'Museu d’Orsay',
  ),
  c(
    'A Torre Eiffel quase foi desmontada',
    'Ela foi criada para durar 20 anos.',
    'Construída para a Exposição Universal de 1889, a Torre Eiffel tinha permissão para ficar de pé por 20 anos. Muitos artistas a criticaram. Ela foi salva porque se mostrou útil como antena de rádio e acabou virando o símbolo de Paris.',
    'Tour Eiffel',
  ),
]
