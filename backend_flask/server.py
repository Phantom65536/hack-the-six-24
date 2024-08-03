from datetime import datetime

from flask import Flask, request, jsonify
from flask_cors import CORS
import time
import os
import google.generativeai as genai
from dotenv import load_dotenv
from google.generativeai import GenerativeModel
from flasgger import Swagger

app = Flask("backend_server")
swagger = Swagger(app)
CORS(app)

load_dotenv()
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))

model = GenerativeModel("gemini-1.5-flash-001")

@app.route('/api/upload', methods=['POST'])
def upload_driving_summary():
    """
    Endpoint to upload driving summary data. (WARNING: beware of http request timeout as it may take over 30s)
    ---
    parameters:
      - name: video_file_name
        in: json
        type: string
        required: true
        description: Name of the video file (Frontend side can obtain after calling `genai.upload_file(path=video_file_name).name`)
      - name: shoulder_check_done
        in: json
        type: integer
        required: true
        description: Number of shoulder checks done
      - name: number_of_turns
        in: json
        type: integer
        required: true
        description: Number of turns made
      - name: drowsiness_detected
        in: json
        type: integer
        required: true
        description: Number of drowsiness detected
    responses:
      200:
        description: A JSON response with the uploaded data
        schema:
          id: VideoSummary
          properties:
            timestamp:
              type: string
              description: The timestamp of the request
            video_file_name:
              type: string
              description: Name of the video file
            shoulder_check_done:
              type: integer
              description: Number of shoulder checks done
            number_of_turns:
              type: integer
              description: Number of turns made
            drowsiness_detected:
              type: integer
              description: Number of drowsiness detected
            summary:
              type: string
              description: The generated summary
            title:
              type: string
              description: The generated title
            embedding:
              type: array
              items:
                type: number
              description: The generated embedding
      400:
        description: No data provided
      500:
        description: Gemini API error
    """
    # Get JSON data from the request
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    # Extracting data from the JSON payload
    video_file_name = data.get('video_file_name')
    shoulder_check_done = data.get('shoulder_check_done')
    number_of_turns = data.get('number_of_turns')
    drowsiness_detected = data.get('drowsiness_detected')
    print("Data received:")
    for key, value in data.items():
        if value is not None:
            print(f"{key}: {value}")
        else:
            print(f"{key}: Not provided")
            return jsonify({"error": f"Missing data for {key}"}), 400

    # Check whether the file is ready to be used.
    try:
        video_file = None
        while video_file is None or video_file.state.name == "PROCESSING":
            print('.', end='')
            time.sleep(2)
            video_file = genai.get_file(video_file_name)

        if video_file.state.name == "FAILED":
          raise ValueError(video_file.state.name)
    except Exception as e:
        return jsonify({"Error when retrieving video file": str(e)}), 500

    # List all files
    for file in genai.list_files():
        print(f"{file.display_name}, NAME: {file.name}, URI: {file.uri}")

    # Generate the prompt
    prompt = f"""
    The camera can only record the face and upper body of the person.
    ------------------------------------------------
    Here is the statistic of the person:
    - Shoulder check done / number of turns: {shoulder_check_done} / {number_of_turns}
    - Drowsiness Detected: {drowsiness_detected}
    ------------------------------------------------
    Evaluate how the driver perform in the video, in 2 criteria: 
    - shoulder checks
    - drowsiness
    ------------------------------------------------
    For each criteria, assign a tag to the driver:
    - good
    - excellent
    - room for improvement
    ------------------------------------------------
    Also give explanation for the tag assigned as follow:
    - good: Give what the driver did well, and what can be improved
    - excellent: Give what the driver did well, and encourage to keep up the good work
    - room for improvement: Give suggestions on how the driver can improve his/her driving.
    ------------------------------------------------
    """
    print("Prompt:")
    print(prompt)

    try:
        # Upload the video file and generate the response
        contents = [video_file, prompt]
        summary = model.generate_content(contents).text
        print(summary)
    except Exception as e:
        return jsonify({"Error when generating summary": str(e)}), 500

    try:
        title_prompt = f"""
        Generate a title for the driving behavior summary:
        {summary}
        -------
        Directly generate the title.
        """
        title = model.generate_content(title_prompt).text
        print(title)
    except Exception as e:
        return jsonify({"Error when generating title": str(e)}), 500

    try:
        embedding = genai.embed_content(
            model="models/text-embedding-004",
            content=summary,
            task_type="retrieval_document",
            title=title)['embedding']
        print(str(embedding)[:50], '... TRIMMED]')
    except Exception as e:
        return jsonify({"Error when embedding content": str(e)}), 500

    response = {
        "timestamp": datetime.now().isoformat(),
        "video_file_name": video_file_name,
        "shoulder_check_done": shoulder_check_done,
        "number_of_turns": number_of_turns,
        "drowsiness_detected": drowsiness_detected,
        "summary": summary,
        "title": title,
        "embedding": embedding
    }

    # TODO: push response to database

    return jsonify(response), 200

@app.route('/api/query', methods=['POST'])
def query_summary():
    """
    Endpoint to query driving summaries.
    ---
    parameters:
        - name: query
          in: json
          type: string
          required: true
          description: The query string to search for relevant summaries
    responses:
        200:
            description: A JSON response with the query embedding and a placeholder response
            schema:
                id: QueryResponse
                properties:
                    timestamp:
                        type: string
                        description: The timestamp of the request
                    query:
                        type: string
                        description: The query string
                    query_embedding:
                        type: array
                        items:
                            type: number
                        description: The query embedding
                    fetched_summary:
                        type: string
                        description: The fetched summary
                    response:
                        type: string
                        description: The response to the query
        400:
            description: No data provided
        500:
            description: Gemini API error
    """
    # Get JSON data from the request
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    # Extracting data from the JSON payload
    query = data.get('query')
    if not query:
        return jsonify({"error": "Missing query"}), 400

    # Load the summary table
    try:
        query_embedding = genai.embed_content(model="models/text-embedding-004",
                                              content=query,
                                           task_type="retrieval_query")["embedding"]
    except Exception as e:
        return jsonify({"Error when embedding query": str(e)}), 500

    # TODO: do vector search to get relevant summary

    fetched_summary = """
    The driver performed **room for improvement** in shoulder checks and **room for improvement** in drowsiness.
    
    **Shoulder checks:** The driver only did 2 shoulder checks out of 3 turns, which is not enough. It's important to do a shoulder check before every turn, to make sure there are no vehicles or pedestrians coming. 
    
    **Suggestions for improvement:** The driver should make a conscious effort to do a shoulder check before every turn. It's also important to practice doing shoulder checks in a safe environment, such as a parking lot. 
    
    **Drowsiness:** The driver showed signs of drowsiness, which is very dangerous. Drowsiness can impair reaction time and make it difficult to stay focused on the road. 
    
    **Suggestions for improvement:** The driver should avoid driving when tired. It's important to get enough sleep before driving, and to take breaks if you start to feel drowsy. If you're feeling sleepy, pull over to a safe place and take a nap or get some coffee.
    """

    question_answering_prompt = f"""
    You are a helpful and informative bot that answers questions using text from the reference driving summary included below. \
    Be sure to respond in a complete sentence, being comprehensive, including all relevant background information. \
    However, you are talking to a customer, so be sure to break down complicated concepts and \
    strike a friendly and converstional tone. \
    If the passage is irrelevant to the answer, you may ignore it.
    ------------------------------------------------
    QUESTION: 
    '{query}'
    ------------------------------------------------
    SUMMARY: 
    '{fetched_summary}'
    ------------------------------------------------
    ANSWER:
    """

    try:
        answer = model.generate_content(question_answering_prompt).text
    except Exception as e:
        return jsonify({"Error when generating answer from fetched summary": str(e)}), 500


    response = {
        "timestamp": datetime.now().isoformat(),
        "query": query,
        "query_embedding": query_embedding,
        "fetched_summary": fetched_summary,
        "response": answer
    }
    return jsonify(response), 200

if __name__ == '__main__':
    app.run(host='localhost', debug=True, port=6000)