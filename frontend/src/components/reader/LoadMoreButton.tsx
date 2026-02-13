interface LoadMoreButtonProps {
  remaining: number;
  onClick: () => void;
}

export const LoadMoreButton = ({ remaining, onClick }: LoadMoreButtonProps) => {
  return (
    <button onClick={onClick} className="btn-secondary w-full py-3">
      Show 20 more articles ({remaining} remaining)
    </button>
  );
};
