import { useState, useRef, useEffect } from "react";
import { MdClose, MdMic, MdStop } from "react-icons/md";
import { uploadVoiceAudio } from "../apis/taskApi";
import { useAppDispatch } from "../store/hooks";
import { setVoiceInput, setVoiceUploading } from "../store/taskSlice";

type VoiceInputProps = {
  isOpen: boolean;
  onClose: () => void;
};

function VoiceInput({ isOpen, onClose }: VoiceInputProps) {
  const dispatch = useAppDispatch();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState<string>("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen) {
      stopRecording();
      setRecordingTime(0);
      setError("");
    }
  }, [isOpen]);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording]);

  const startRecording = async () => {
    try {
      setError("");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        dispatch(setVoiceUploading(true));
        try {
          const response = await uploadVoiceAudio(audioBlob);

          if (response && response.data) {
            dispatch(
              setVoiceInput({
                transcribedText: response.transcript || "",
                voiceInputTitle: response.data.title || "",
                voiceInputDescription: response.data.description || "",
                voiceInputStatus: response.data.status || "TODO",
                voiceInputPriority: response.data.priority || "MEDIUM",
                voiceInputDueDate: response.data.due_date || "",
              })
            );
          }
        } catch (error) {
          setError("Failed to process audio. Please try again.");
        } finally {
          dispatch(setVoiceUploading(false));
        }

        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
    } catch (err) {
      setError(
        "Failed to access microphone. Please allow microphone permissions."
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setTimeout(() => {
        onClose();
      }, 500);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-6 w-full max-w-md mx-4 text-white">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Voice Input</h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white transition-colors"
            title="Close"
          >
            <MdClose size={24} />
          </button>
        </div>

        <div className="flex flex-col items-center gap-4 mb-6">
          <div
            className={`w-24 h-24 rounded-full flex items-center justify-center ${
              isRecording
                ? "bg-red-500 animate-pulse"
                : "bg-neutral-800 border-2 border-neutral-600"
            }`}
          >
            <MdMic
              size={48}
              className={isRecording ? "text-white" : "text-neutral-400"}
            />
          </div>

          <div className="text-2xl font-mono font-semibold">
            {formatTime(recordingTime)}
          </div>

          <div className="text-sm text-neutral-400">
            {isRecording ? "Recording in progress..." : "Ready to record"}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900 bg-opacity-30 border border-red-700 rounded text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          {!isRecording ? (
            <button
              onClick={startRecording}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <MdMic size={20} />
              Start Recording
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="flex-1 bg-neutral-700 hover:bg-neutral-600 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <MdStop size={20} />
              Stop Recording
            </button>
          )}
        </div>

        <div className="mt-4 text-xs text-neutral-500 text-center">
          Click "Start Recording" and speak.
        </div>
      </div>
    </div>
  );
}

export default VoiceInput;
