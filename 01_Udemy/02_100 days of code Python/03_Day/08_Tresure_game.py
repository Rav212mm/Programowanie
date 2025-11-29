print("Welcome to the Tresure Island!")

direction = input("Left or right?\n")
if direction.lower() == 'right':
    print('GAME OVER !!!\n')
else:
    action = input("Swim or wait?\n")
    if action.lower() == 'swim':
        print('GAME OVER !!!\n')
    else:
        color = input("Color of the door: Red, Yellow or Blue?\n")
        if color.lower() == 'yellow':
            print('YOU WIN !!!')
        else:
            print('YOU LOST !!!')