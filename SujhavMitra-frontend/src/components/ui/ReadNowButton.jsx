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
    <a
      href={readUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="px-6 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition-colors"
    >
      Read Now
    </a>
  );
};

export default ReadNowButton;
