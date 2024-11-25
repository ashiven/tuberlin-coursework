import os
import csv

# move first timestamp two days back and space by 30 min intervals
def adjust_timestamps(input_file, output_file):
    with open(input_file, 'r') as infile:
        reader = csv.reader(infile)
        input_data = list(reader)
    
    first_timestamp = int(input_data[1][0]) - 172800
    adjusted_data = [input_data[0]]
    
    for i, row in enumerate(input_data[1:]):
        new_timestamp = first_timestamp + 1800 * i
        adjusted_row = [str(new_timestamp)] + row[1:]
        adjusted_data.append(adjusted_row)
    
    with open(output_file, 'w', newline='') as outfile:
        writer = csv.writer(outfile)
        writer.writerows(adjusted_data)

for filename in os.listdir():
    if filename.endswith(".csv"):
        adjust_timestamps(filename, filename) 
