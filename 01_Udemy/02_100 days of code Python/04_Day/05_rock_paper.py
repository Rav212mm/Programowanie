import random

rock = '''
    _______
---'   ____)
      (_____)
      (_____)
      (____)
---.__(___)
'''

paper = '''
    _______
---'   ____)____
          ______)
          _______)
         _______)
---.__________)
'''

scissors = '''
    _______
---'   ____)____
          ______)
       __________)
      (____)
---.__(___)
'''

#Write your code below this line 👇

my_dec = input("\nWhat to choose: Rock(R), Scissors(S) or Paper(P)? ")
choice = random.randint(0, 2)
print(choice)

if choice == 0:
    print('Comp choice is the Rock')
    print(rock)
if choice == 1:
    print('Comp choice is the Scissors')
    print(scissors)
if choice == 2:
    print('Comp choice is the Paper')
    print(paper)

if my_dec == 'P':
    print('You picked: ')
    print(paper)
if my_dec == 'S':
    print('You picked: ')
    print(scissors)
if my_dec == 'R':
    print('You picked: ')
    print(rock)

if choice == 0 :
    if my_dec == "R":
        print('There is a draw both ROCKS')
    if my_dec == "S":
        print('You LOOSE')
    if my_dec == "P":
        print('You WIN')

if choice == 1 :
    if my_dec == "S":
        print('There is a draw both SCISSORS')
    if my_dec == "P":
        print('You LOOSE')
    if my_dec == "R":
        print('You WIN')

if choice == 2 :
    if my_dec == "P":
        print('There is a draw both PAPERS')
    if my_dec == "S":
        print('You LOOSE')
    if my_dec == "R":
        print('You WIN')

print('Run the game once again !!\n')