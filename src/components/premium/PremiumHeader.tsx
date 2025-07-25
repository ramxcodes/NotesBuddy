interface PremiumHeaderProps {
  isActive: boolean;
}

export function PremiumHeader({ isActive }: PremiumHeaderProps) {
  return (
    <div className="mb-12 text-center">
      <h1 className="mb-4 text-4xl font-bold md:text-5xl">
        {isActive ? "Your Premium Status" : "Upgrade to Premium"}
      </h1>
      <p className="mx-auto max-w-2xl text-lg text-gray-600">
        {isActive
          ? "Manage your premium subscription and benefits"
          : "Upgrade to Premium for exclusive features and benefits"}
      </p>
    </div>
  );
}
