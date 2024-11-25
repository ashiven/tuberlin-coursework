import pathlib
import pandas as pd
import seaborn as sns
from matplotlib import pyplot as plt
import matplotlib.dates as md
import datetime as dt

# Set the path to the CSV files as an absolute path !!!!
csv_folder_path = pathlib.Path("/home/ashiven/Documents/Uni/WS24/CC/HA1/results")

machine_types = ["c3", "c4", "n4"]
platforms = ["native", "docker", "kvm", "qemu"]
metrics = ["cpu", "mem", "diskRand", "diskSeq"]

temp_df_list = []

for mt in machine_types:
    for p in platforms:
        # Use the CSV file from the specified path
        path_to_file = csv_folder_path.joinpath(f"{mt}-{p}-results.csv")
        if path_to_file.exists():
            temp_df = pd.read_csv(path_to_file, sep=',')  # Default to using comma as a separator
            temp_df["time"] = pd.to_datetime(temp_df["time"], unit='s')
            temp_df["time"] = md.date2num(temp_df["time"])
            temp_df["machine_type"] = mt
            temp_df["platform"] = p
            temp_df_list.append(temp_df)

# Concatenate all data
if len(temp_df_list) > 0:
    final_df = pd.concat(temp_df_list, ignore_index=True)
else:
    print("No data found. Make sure the CSV files are in the correct directory and properly formatted.")
    exit()

# Create the figure with a grid of subplots
fig, axes = plt.subplots(len(metrics), len(machine_types), figsize=(12, 8), sharex=True, sharey='row')

for i, m in enumerate(metrics):
    for j, mt in enumerate(machine_types):
        ax = axes[i, j]
        sub_df = final_df.loc[final_df.machine_type == mt, ["time", "platform", m]].copy()
        if len(sub_df):
            sns.lineplot(data=sub_df, ax=ax, x="time", y=m, hue="platform")
        xfmt = md.DateFormatter('%d.%m.%Y %H:%M:%S')
        ax.xaxis.set_major_formatter(xfmt)
        ax.set_xticks(ax.get_xticks())
        ax.set_xticklabels([label.get_text() for label in ax.get_xticklabels()], rotation=45)
        if i == 0:
            ax.set_title(f"Machine Type: {mt.capitalize()}", fontsize=14)
        handles, labels = ax.get_legend_handles_labels()
        ax.legend([], [], frameon=False)

# Create the legend outside of the subplots
if handles and labels:
    legend = fig.legend(handles, labels, loc='upper center', bbox_to_anchor=(0.5, 1.05),
                        fancybox=True, ncol=4, framealpha=1.0, shadow=True, fontsize=12)

plt.tight_layout()

# Save the output image to the same directory as the CSV files
output_file_path = csv_folder_path.joinpath("all-results-plot.png")
plt.savefig(output_file_path, dpi=300, bbox_inches="tight")

print(f"Saved plot to {output_file_path}")
