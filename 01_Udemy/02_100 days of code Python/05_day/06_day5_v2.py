#Password Generator Project
import random

letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
symbols = ['!', '#', '$', '%', '&', '(', ')', '*', '+']

print("Welcome to the PyPassword Generator!")
nr_letters= int(input("How many letters would you like in your password?\n")) 
nr_symbols = int(input(f"How many symbols would you like?\n"))
nr_numbers = int(input(f"How many numbers would you like?\n"))

#Hard Level - Order of characters randomised:
#e.g. 4 letter, 2 symbol, 2 number = g^2jk8&P

no_pass = nr_letters + nr_symbols + nr_numbers
znaki = [letters, symbols, numbers]
print(f"Liczba znaków w haśle {no_pass}")

counter = [nr_letters, nr_symbols, nr_numbers]
print(counter, type(counter))

password = ''

while len(password) < no_pass:
    print(f" {len(password)} Długość hasła przed generowaniem")
    print(f" {no_pass} Wymagana długość hasła")
    type = random.randint(1,3)
    print(f"Typ :{type}") 

    if type == 1 and counter[0]>0:
        password += random.choice(znaki[0])
        counter[0] -= 1     
    if type == 2 and counter[1]>0:
        password += random.choice(znaki[1])
        counter[1] -= 1
    if type == 3 and counter[2]>0:
        password += random.choice(znaki[2])
        counter[2] -= 1
    print(f" {len(password)} Długość obecna nowa hasła PO")

print(password)