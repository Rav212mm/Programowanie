#lista od 1 do 10 z krokiem 3

suma = 0
for number in range (2,101,2):
    #if number % 2 == 0:
        suma += number
print(suma)

suma = 0
for number in range (1,101):
    if number % 2 == 0:
        suma += number
print(suma)