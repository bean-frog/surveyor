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
LIKERT_SCALE_OPTIONS = ["1", "2", "3", "4", "5"] # used to correctly order Likert Scale

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

    plt.figure(figsize=(6, 4))
    plt.bar(all_responses, frequencies, color='skyblue')
    plt.xlabel('Response')
    plt.ylabel('Frequency')
    plt.title(f"Q{question_id}: {wrapped_text}")
    
    output_filename = os.path.join(GRAPH_DIR, f"question_{question_id}_graph.png")
    plt.savefig(output_filename, bbox_inches='tight')
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

# uses the kitty graphics protocol (kitten icat) to display image
def display_image(image_path):
    if image_path and os.path.exists(image_path):
        subprocess.run(["kitten", "icat", image_path])

def main():
    try:
        questions_data = load_json("questions.json")
    except:
        print("questions.json not found. Please make sure it is in the same directory as this file")
        sys.exit()
    try:
        responses_data = load_json("responses.json")
    except:
        print("responses.json not found. Please make sure it is in the same directory as this file")
        sys.exit()
    
    
    responses_list = responses_data.get("responses", [])
    saved_images = []

    for question in questions_data.get("questions", []):
        qid = question.get("id")
        qtype = question.get("type")
        qtext = question.get("question", "No question text provided")

        if qtype == "3":  
            continue
        
        key = f"q{qid}"
        question_responses = [resp[key] for resp in responses_list if key in resp]

        if not question_responses:
            print(f"No responses found for question {qid}. Including all possible choices.")
            question_responses = []  # Ensure graph still appears

        image_path = create_graph(qid, qtext, question_responses, qtype)
        saved_images.append(image_path)

    combined_image_path = create_combined_image(saved_images)
    if combined_image_path:
        display_image(combined_image_path)

if __name__ == "__main__":
    main()
