"""Gera os ícones PNG do PWA a partir da geometria de design/icone.svg (sem dependências)."""
import math, struct, zlib, sys

ROXO, AMARELO = (0x4F, 0x46, 0xE5), (0xFB, 0xBF, 0x24)

def quad(p0, p1, p2, n=16):
    return [((1-t)**2*p0[0]+2*(1-t)*t*p1[0]+t*t*p2[0], (1-t)**2*p0[1]+2*(1-t)*t*p1[1]+t*t*p2[1]) for t in (i/n for i in range(n+1))]

topo = [(37, 36), (61, 36)]
haste = [(49, 36), (49, 56)] + quad((49, 56), (49, 66), (39, 66))[1:] + quad((39, 66), (33, 66), (32, 60))[1:]
SEGS = [(a, b) for pl in (topo, haste) for a, b in zip(pl, pl[1:])]

def dist_seg(px, py, a, b):
    ax, ay = a; bx, by = b
    dx, dy = bx-ax, by-ay
    t = max(0, min(1, ((px-ax)*dx+(py-ay)*dy)/(dx*dx+dy*dy)))
    return math.hypot(px-(ax+t*dx), py-(ay+t*dy))

def in_rrect(x, y, x0, y0, x1, y1, r):
    if not (x0 <= x <= x1 and y0 <= y <= y1): return False
    cx = min(max(x, x0+r), x1-r); cy = min(max(y, y0+r), y1-r)
    return math.hypot(x-cx, y-cy) <= r

def render(size, raio, ss=3):
    esc = 96/size
    linhas = []
    for j in range(size):
        row = bytearray([0])
        for i in range(size):
            r = g = b = a = 0
            for sj in range(ss):
                for si in range(ss):
                    x = (i+(si+.5)/ss)*esc; y = (j+(sj+.5)/ss)*esc
                    if not in_rrect(x, y, 0, 0, 96, 96, raio): continue
                    col = ROXO
                    if in_rrect(x, y, 22, 22, 74, 74, 10):
                        col = AMARELO
                        if 28 <= x <= 66 and 30 <= y <= 72 and any(dist_seg(x, y, s[0], s[1]) <= 4.5 for s in SEGS):
                            col = ROXO
                    r += col[0]; g += col[1]; b += col[2]; a += 1
            n = ss*ss
            if a: row += bytes((round(r/a), round(g/a), round(b/a), round(255*a/n)))
            else: row += bytes((0, 0, 0, 0))
        linhas.append(bytes(row))
    return linhas

def salvar(caminho, size, raio):
    raw = b''.join(render(size, raio))
    def chunk(t, d): return struct.pack('>I', len(d))+t+d+struct.pack('>I', zlib.crc32(t+d))
    png = b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR', struct.pack('>IIBBBBB', size, size, 8, 6, 0, 0, 0))+chunk(b'IDAT', zlib.compress(raw, 9))+chunk(b'IEND', b'')
    open(caminho, 'wb').write(png)
    print(caminho, size)

if __name__ == '__main__':
    d = sys.argv[1] if len(sys.argv) > 1 else 'public'
    salvar(f'{d}/icon-192.png', 192, 22)
    salvar(f'{d}/icon-512.png', 512, 22)
    salvar(f'{d}/icon-maskable-512.png', 512, 0)
    salvar(f'{d}/apple-touch-icon.png', 180, 0)
