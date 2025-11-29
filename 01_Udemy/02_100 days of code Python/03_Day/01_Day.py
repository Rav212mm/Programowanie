
from turtle import clearscreen


odp = 'y'
liczba = 0

while odp == 'y':
    clearscreen
    #print( f'Reszta z dzielenia to: {int(liczba % 2)}')
    liczba = int(input('\nWprowadz liczbę:\n'))
    
    if int(liczba % 2) > 0:
        print('Liczba niepodzielna przez 2\n')
    else: 
        print('Liczba podzielna przez 2 !\n')

    odp = str(input('Czy powtoryc (y/n)? \n'))

