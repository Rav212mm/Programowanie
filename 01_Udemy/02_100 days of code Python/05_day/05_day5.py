#Password Generator Project
import random
letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
symbols = ['!', '#', '$', '%', '&', '(', ')', '*', '+']

print("Welcome to the PyPassword Generator!")
nr_letters= int(input("How many letters would you like in your password?\n")) 
nr_symbols = int(input(f"How many symbols would you like?\n"))
nr_numbers = int(input(f"How many numbers would you like?\n"))

#Eazy Level - Order not randomised:
#e.g. 4 letter, 2 symbol, 2 number = JduE&!91


#Hard Level - Order of characters randomised:
#e.g. 4 letter, 2 symbol, 2 number = g^2jk8&P

znaki =[letters, symbols, numbers]
no_signs = nr_letters + nr_symbols + nr_numbers
print(f"Hasło musi zawierać {no_signs} znaki")

password =''

nr_letters_in_pasword = 0
nr_symbols_in_pasword = 0
nr_numbers_in_pasword = 0

for i in range(0, no_signs):
    print(f"ITERACJA NR {i}")
    typ = random.randint(1,3)
    if typ == 1:
        print('Wylosowano LETTERS')
        print(f"Ma być {nr_letters} LETTERS")
        print(f"Jest {nr_letters_in_pasword} LETTERS")
        if nr_letters > nr_letters_in_pasword:
            print(password)
            password = password + str(random.choice(znaki[0]))
            nr_letters_in_pasword += 1
            print(password)

    if typ == 2:
        print('Wylosowano SYMBOLSS')
        print(f"Ma być {nr_symbols} SYMBOLSS")
        print(f"Jest {nr_symbols_in_pasword} SYMBOLSS")
        if nr_symbols > nr_symbols_in_pasword:
            print(password)
            password = password + str(random.choice(znaki[1]))
            nr_symbols_in_pasword += 1
            print(password)
            
    if typ == 3:
        print('Wylosowano NUMBERS')
        print(f"Ma być {nr_numbers} NUMBERS")
        print(f"Jest {nr_numbers_in_pasword} NUMBERS")
        if nr_numbers > nr_numbers_in_pasword:
            print(password)
            password = password + str(random.choice(znaki[2]))
            nr_numbers_in_pasword += 1
            print(password)

print(password)
    