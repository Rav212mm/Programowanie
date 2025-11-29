# 🚨 Don't change the code below 👇
row1 = ["⬜️","⬜️","⬜️"]
row2 = ["⬜️","⬜️","⬜️"]
row3 = ["⬜️","⬜️","⬜️"]
map = [row1, row2, row3]


print(f"{row1}\n{row2}\n{row3}")
position = input("Where do you want to put the treasure? ")
# 🚨 Don't change the code above 👆
position_1 = int(position[0])-1
position_2 = int(position[1])-1
print(position_1)
print(position_2)

#Write your code below this row 👇
print(map)
print(map[0][2])

map[position_1][position_2]='X'
print(f"{row1}\n{row2}\n{row3}")