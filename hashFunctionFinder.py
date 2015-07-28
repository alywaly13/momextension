def testHashFunction(funct, m):
    freq = {}
    for i in range(7, 12):
        for j in range(0,32):
            h = funct(i,j,m)
            print i, j, h
            if h in freq:
                freq[h] = freq[h] + 1
            else:
                freq[h]=0
    return freq

def hashFunction(x, y, m):
    a = int(str(y)+str(x))
    return (int(13*a**2 + 21419*y**2))%m

def h(x,y,m):
    str(x)+str(y)
    
