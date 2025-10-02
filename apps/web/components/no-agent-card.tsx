import Image from "next/image";
import React from "react";

type Props = {};

const NoAgentCard = (props: Props) => {
  return (
    <div className="max-w-lg mx-auto">
      <div className="relative h-80 mb-6 rounded-lg shadow-2xl overflow-hidden">
        <Image
          src="/no-agent-card.png"
          alt="No agents illustration"
          fill={true}
          priority={true}
          className="object-fill"
        />
      </div>
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-4">Oops! No agents yet</h3>
        <p>
          Automate support, marketing and answering customer questions by
          creating your first AI Agent in Saya.
        </p>
      </div>
    </div>
  );
};

export default NoAgentCard;
