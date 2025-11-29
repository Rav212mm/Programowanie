liczba = input('Podaj liczbę\n')
print(liczba)

try:

    print(type(liczba))

    a = liczba[0]
    b = liczba[1]

    print(a,b)

    a = int(a)
    b = int(b)

    print(a+b)

except(ValueError):
    print('Cant convert to integer')