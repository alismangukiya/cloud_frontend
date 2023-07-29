import React, { useState } from "react";
import { FileUploader } from "react-drag-drop-files";
import axios from "axios"; // Import Axios

const fileTypes = ["JPG", "PNG", "GIF", "PDF"];

function DragDrop() {
  const [file, setFile] = useState(null);
  const [responseText, setResponseText] = useState("");

  const handleChange = (file) => {
    setFile(file);
  };

  const encodeFile = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result.split(",")[1]); // Extracting the base64 encoded file content
      };
      reader.readAsDataURL(file);
    });
  };

  const submitFileToServer = async (file) => {
    if (!file) {
      console.error("No file selected.");
      return;
    }

    try {
      const encodedFileContent = await encodeFile(file);

      const requestData = {
        file_name: file.name,
        file_content: encodedFileContent,
      };

      const response = await axios.post(
        `${process.env.REACT_APP_EXTRACT_LAMBDA_URL}/upload`,
        requestData,
      );

      if (!response.status === 200) {
        throw new Error("Failed to upload file.");
      }

      const data = response.data;
      console.log("File uploaded successfully:", data);

      // Set the response data in the state variable
      setResponseText(JSON.stringify(data, null, 2));
    } catch (error) {
      console.error("Error uploading file:", error.message);

      // Clear the response data if there's an error
      setResponseText("");
    }
  };

  return (
    <div className="container d-flex align-items-center justify-content-center vh-100">
      <div className="col-md-6">
        <div className="card">
          <div className="card-body text-center">
            <h5 className="card-title">Drag and Drop your file here</h5>
            <FileUploader handleChange={handleChange} name="file" types={fileTypes} />
            <button className="btn btn-primary mt-3" onClick={() => submitFileToServer(file)}>
              Submit
            </button>

            <div className="mt-4">
              {/* Render the response data inside a text field */}
              <textarea
                rows="10"
                cols="50"
                value={responseText}
                readOnly
                className="form-control"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DragDrop;
