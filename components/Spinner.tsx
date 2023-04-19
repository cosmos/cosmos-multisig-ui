interface SpinnerProps {
  readonly size?: number;
}

const Spinner = ({ size }: SpinnerProps) => (
  <>
    <div className="spinner"></div>
    <style jsx>{`
      .spinner {
        border: ${size || 2}px solid #f3f3f3;
        border-top: ${size || 2}px solid #561253;
        border-radius: 50%;
        width: ${size || 16}px;
        height: ${size || 16}px;
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }
    `}</style>
  </>
);

export default Spinner;
