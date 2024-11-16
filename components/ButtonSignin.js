/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import LoginModal from "./LoginModal";

const ButtonSignin = ({ text = "Get started", extraStyle }) => {
  const { data: session, status } = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // If we're on the login page, we don't want to show the modal
  const openLoginModal = () => {
    // If we're already on the login page, don't show the modal
    if (window.location.pathname === '/auth/login') {
      return;
    }
    setIsModalOpen(true);
  };

  // Show welcome message when authenticated
  if (status === "authenticated") {
    return (
      <span key={session.user?.image} className="text-base-content">
        Welcome, {session.user?.name || session.user?.email || "User"}
      </span>
    );
  }

  // Show login button and modal when not authenticated
  return (
    <>
      <button
        className={`btn ${extraStyle ? extraStyle : ""}`}
        onClick={openLoginModal}
      >
        {text}
      </button>
      {isModalOpen && <LoginModal isAutoOpen={true} />}
    </>
  );
};

export default ButtonSignin;
