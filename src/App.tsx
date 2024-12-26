/* eslint-disable @typescript-eslint/no-unused-vars */
import { Separator } from "@/components/ui/separator";
import React, { useEffect, useState } from "react";
import { AutosizeTextarea } from "./components/ui/autosize-textarea";
import { Button } from "./components/ui/button";

type User = {
  accesToken: string;
  userId: string;
};

const App: React.FC = () => {
  const [user, setUser] = useState<User>();
  const [thought, setThought] = useState("");
  const [submissionState, setSubmissionState] = useState("");

  const addBookmarkQuickie = async () => {
    if (user) {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      // Make a POST request (replace with your URL and any required data)
      const postData = {
        type: "link",
        data: tab.url,
      };

      fetch("https://web.thinkerapp.org/api/extension", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + user.accesToken,
          "x-supabase-user-id": user.userId,
        },
        body: JSON.stringify(postData),
      })
        .then((response) => {
          if (!response.ok) {
            console.log("Error response", response);
            setSubmissionState("failed");
            return;
          }
          console.log("Success Response", response);
          setSubmissionState("success");
        })
        .catch((error) => {
          console.log(error);
          setSubmissionState("failed");
        });
    }
  };

  const addTextQuickie = async () => {
    if (user) {
      // Make a POST request (replace with your URL and any required data)
      const postData = {
        type: "text",
        data: thought,
      };

      fetch("https://web.thinkerapp.org/api/extension", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + user.accesToken,
          "x-supabase-user-id": user.userId,
        },
        body: JSON.stringify(postData),
      })
        .then((response) => {
          if (!response.ok) {
            console.log("Error response", response);
            setSubmissionState("failed");
            return;
          }
          console.log("Success response", response);
          setThought("");
          setSubmissionState("success");
        })
        .catch((error) => {
          console.log("Error Response", error);
          setSubmissionState("failed");
        });
    }
  };

  useEffect(() => {
    async function loadCookie() {
      // const cookieInput = document.getElementById('cookieValue');
      // const bookmarkButton = document.getElementById('bookmarkButton');

      // Change this to the domain you want to read the session cookie from
      const targetUrl = "https://web.thinkerapp.org";

      // Retrieve session cookie from the target URL
      const cookies = await chrome.cookies.getAll({ url: targetUrl });
      if (cookies.length) {
        const accesTokenCookie = cookies.find(
          (cookie) => cookie.name === "thinker-access-token"
        );
        const userIdCookie = cookies.find(
          (cookie) => cookie.name === "thinker-user-id"
        );
        if (accesTokenCookie && userIdCookie) {
          setUser({
            accesToken: accesTokenCookie.value,
            userId: userIdCookie.value,
          });
        }
      }
    }
    loadCookie();
  }, []);

  useEffect(() => {
    if (submissionState === "success") {
      setTimeout(() => {
        setSubmissionState("");
      }, 5000);
    }
  }, [submissionState]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleKeyPress = (event: any) => {
    if (event.key === "Enter" && thought.length) {
      event.preventDefault();
      addTextQuickie();
    }
  };

  return submissionState === "failed" ? (
    <div className="px-4 pt-2 pb-4 flex flex-col w-96 bg-red-400">
      <p className="text-sm">
        Oops, something went wrong. Please make sure you are logged in to{" "}
        <a
          className="text-blue-800 underline"
          href="https://web.thinkerapp.org/login"
          target="_blank"
        >
          Thinker
        </a>
      </p>
    </div>
  ) : user ? (
    <div className="px-4 pt-2 pb-4 flex flex-col w-96">
      <div className="flex flex-row justify-between items-center w-full">
        <p className="text-md font-black text-neutral-800">
          Add link to current page
        </p>
        <Button
          className="text-xs"
          size={"sm"}
          onClick={() => addBookmarkQuickie()}
        >
          Quickie Link
        </Button>
      </div>
      <Separator className="mt-2" />
      <AutosizeTextarea
        autoFocus
        placeholder="Or dump your thoughts, texts from website, etc here..."
        value={thought}
        onKeyDown={(e) => handleKeyPress(e)}
        onChange={(e) => setThought(e.target.value)}
        maxHeight={200}
        className="mt-2"
      />
      <div className="mt-3 flex flex-row justify-between items-center ">
        <p className="text-sm text-green-600">
          {submissionState === "success" ? "Added Successfully" : null}
        </p>
        <div className="flex flex-row items-center gap-4">
          <p className="text-sm text-neutral-500">Enter</p>
          <Button
            disabled={thought.length === 0}
            onClick={() => addTextQuickie()}
            className="text-xs"
            size={"sm"}
          >
            Quickie Thought
          </Button>
        </div>
      </div>
    </div>
  ) : (
    <div className="p-4 flex flex-col justify-center items-center w-96">
      <p className="text-md">
        You are not logged into Thinker. Please do it{" "}
        <a
          className="text-blue-400 underline"
          href="http://web.thinkerapp.org/login"
          target="_blank"
        >
          here
        </a>
      </p>
    </div>
  );
};

export default App;
