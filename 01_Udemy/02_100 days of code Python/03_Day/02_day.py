
wzrost = int(input('Wprowadz swój wzrost: '))
    
if wzrost >=120:
    wiek = int(input('\nWprowadz ile masz lat ?\n'))
    if wiek >= 18:
        print('Płacisz $12\n')
    elif wiek <12:
        print('Płacisz $7\n')
    else:
        print('Płacisz $10\n')
else: 
    print('Jesteś za niski !\n')
