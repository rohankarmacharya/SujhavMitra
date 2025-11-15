import { useState, useEffect } from "react";
import { useAuth } from "../context/useAuth";
import DiscoverTab from "./tabs/DiscoverTab";
import MyRatingsTab from "./tabs/MyRatingsTab";
import RecommendationsTab from "./tabs/RecommendationsTab";
import { showToast } from "../utils/toast";

export default function Books() {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState("discover");

  useEffect(() => {
    showToast("You are in Books");
  }, []);

  const tabs = [
    { id: "discover", label: "Discover", icon: "" },
    { id: "ratings", label: "My Ratings", icon: "", requiresAuth: true },
    { id: "recommendations", label: "For You", icon: "", requiresAuth: true },
  ];

  const handleTabClick = (tab) => {
    const isDisabled = tab.requiresAuth && (!user || !token);

    if (isDisabled) {
      showToast("Please login to access this feature", "error", 2500);
      return;
    }

    setActiveTab(tab.id);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "discover":
        return <DiscoverTab />;
      case "ratings":
        return <MyRatingsTab onSwitchTab={setActiveTab} />;
      case "recommendations":
        return <RecommendationsTab onSwitchTab={setActiveTab} />;
      default:
        return <DiscoverTab />;
    }
  };

  return (
    <div className="Bookpage pt-10 pb-16 min-h-screen bg-gray-50">
      {/* Tabs Navigation */}
      <div className="wrapper pt-6">
        <div className="mx-auto max-w-6xl px-4">
          <div className="bg-white rounded-lg shadow-sm p-1 mb-6">
            <div className="flex gap-2">
              {tabs.map((tab) => {
                const isDisabled = tab.requiresAuth && (!user || !token);
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabClick(tab)}
                    className={`
                      flex-1 px-4 py-3 rounded-lg font-medium transition-all duration-200
                      ${
                        activeTab === tab.id
                          ? "bg-[#4fb4ce] text-white shadow-md"
                          : isDisabled
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed hover:bg-gray-200 hover:shadow-sm active:scale-95"
                          : "bg-white text-gray-700 hover:bg-gray-50 hover:shadow-sm active:scale-95"
                      }
                    `}
                    title={
                      isDisabled ? "Please login to access this feature" : ""
                    }
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.label}
                    {isDisabled && <span className="ml-2 text-xs">🔒</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  );
}
