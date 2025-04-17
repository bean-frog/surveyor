import json
import os
import textwrap
from collections import Counter
import matplotlib.pyplot as plt
import subprocess
from math import ceil, sqrt
from PIL import Image
import sys

GRAPH_DIR = "graphs"
ALL_GRAPH_FILENAME = os.path.join(GRAPH_DIR, "all.png")
LIKERT_SCALE_OPTIONS = ["1", "2", "3", "4", "5"]
GRAPH_BAR_COLOR = "#E59038"
GRAPH_BG_COLOR = "#1D2431"


def load_json(filename):
    with open(filename, 'r') as f:
        return json.load(f)

def wrap_text(text, width=40):
    return "\n".join(textwrap.wrap(text, width))

def get_all_possible_responses(responses, qtype):
    unique_responses = set(responses)

    if qtype == "1":  # Likert Scale
        return LIKERT_SCALE_OPTIONS
    elif all(resp.lower() in ["true", "false"] for resp in unique_responses):  # True/False
        return ["true", "false"]
    else:
        return sorted(unique_responses)

def create_graph(question_id, question_text, responses, qtype):
        all_responses = get_all_possible_responses(responses, qtype)
        response_counts = Counter(responses)
        frequencies = [response_counts.get(resp, 0) for resp in all_responses]
        os.makedirs(GRAPH_DIR, exist_ok=True)
        wrapped_text = wrap_text(question_text)
    
        fig, ax = plt.subplots(figsize=(6, 4), facecolor=GRAPH_BG_COLOR)
        ax.set_facecolor(GRAPH_BG_COLOR)
    
        # Draw bar chart
        ax.bar(all_responses, frequencies, color=GRAPH_BAR_COLOR)
    
        # Set labels and title with white text
        ax.set_xlabel('Response', color='white')
        ax.set_ylabel('Frequency', color='white')
        ax.set_title(f"Q{question_id}: {wrapped_text}", color='white')
    
        # Set tick label colors
        ax.tick_params(axis='x', colors='white')
        ax.tick_params(axis='y', colors='white')
    
        # Save the figure with the facecolor set
        output_filename = os.path.join(GRAPH_DIR, f"question_{question_id}_graph.png")
        plt.savefig(output_filename, bbox_inches='tight', facecolor=fig.get_facecolor())
        plt.close()
    
        print(f"Graph saved as {output_filename}")
        return output_filename
    

def create_combined_image(image_paths):
    if not image_paths:
        print("No images to combine.")
        return None

    images = [Image.open(img) for img in image_paths]
    grid_size = ceil(sqrt(len(images)))
    img_width, img_height = images[0].size
    grid_width = grid_size * img_width
    grid_height = grid_size * img_height

    combined_img = Image.new("RGB", (grid_width, grid_height), "white")

    for idx, img in enumerate(images):
        x = (idx % grid_size) * img_width
        y = (idx // grid_size) * img_height
        combined_img.paste(img, (x, y))

    combined_img.save(ALL_GRAPH_FILENAME)
    print(f"Combined graph saved as {ALL_GRAPH_FILENAME}")
    return ALL_GRAPH_FILENAME

# Uses the kitty graphics protocol (kitten icat) to display the image
def display_image(image_path):
    if image_path and os.path.exists(image_path):
        subprocess.run(["kitten", "icat", image_path])

def main():
    try:
        questions_data = load_json("questions.json")
    except Exception as e:
        print("questions.json not found. Please make sure it is in the same directory as this file")
        sys.exit()

    try:
        responses_data = load_json("responses.json")
    except Exception as e:
        print("responses.json not found. Please make sure it is in the same directory as this file")
        sys.exit()
    
    # Get the optional question id from command-line arguments
    question_arg = None
    if len(sys.argv) > 1:
        try:
            question_arg = int(sys.argv[1])
        except ValueError:
            print("Provided argument is not a valid number. Exiting.")
            sys.exit()

    responses_list = responses_data.get("responses", [])
    saved_images = []
    
    # Process questions
    processed = False
    for question in questions_data.get("questions", []):
        # Convert the question id to an integer for proper comparison
        try:
            qid = int(question.get("id"))
        except ValueError:
            print(f"Question id {question.get('id')} is not a valid number. Skipping.")
            continue

        qtype = question.get("type")
        qtext = question.get("question", "No question text provided")

        # Skip questions of type "3" as before
        if qtype == "3":  
            continue

        # If a specific question id is provided, process only that question.
        if question_arg is not None and qid != question_arg:
            continue
        
        key = f"q{qid}"
        question_responses = [resp[key] for resp in responses_list if key in resp]

        if not question_responses:
            print(f"No responses found for question {qid}. Including all possible choices.")
            question_responses = []  # Ensure graph still appears

        image_path = create_graph(qid, qtext, question_responses, qtype)
        saved_images.append(image_path)
        processed = True

    if question_arg is not None and not processed:
        print(f"No question found with id {question_arg}. Exiting.")
        sys.exit()

    # If processing all questions, create combined image.
    if question_arg is None:
        combined_image_path = create_combined_image(saved_images)
        if combined_image_path:
            display_image(combined_image_path)
    else:
        # Display the single graph for the provided question
        display_image(saved_images[0])

if __name__ == "__main__":
    main()
