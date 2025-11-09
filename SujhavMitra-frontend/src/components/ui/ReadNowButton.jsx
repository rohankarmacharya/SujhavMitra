import { useEffect, useState } from "react";
import { fetchReadUrlByISBN } from "../../services/api";

const ReadNowButton = ({ isbn }) => {
  const [readUrl, setReadUrl] = useState("");

  useEffect(() => {
    if (!isbn) return;
    const load = async () => {
      const url = await fetchReadUrlByISBN(isbn);
      setReadUrl(url);
    };
    load();
  }, [isbn]);

  if (!readUrl) return null;

  return (
    <div className="pagelink mt-4">
      <a href={readUrl} target="_blank" rel="noopener noreferrer">
        Read Now
      </a>
    </div>
  );
};

export default ReadNowButton;
