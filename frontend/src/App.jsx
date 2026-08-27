import { useEffect, useState } from "react";
import api from "./services/api";

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.get("/test")
      .then((response) => {
        setMessage(response.data.message);
      })
      .catch((error) => {
        console.error("API Error:", error);
      });
  }, []);

  return (
    <div>
      <h1>SkillHire</h1>
      <p>{message}</p>
    </div>
  );
}

export default App;