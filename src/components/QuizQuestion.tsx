import React from 'react';
import { motion } from 'framer-motion';
import { Check, X, Info, ArrowRight, HelpCircle, Clock } from 'lucide-react';
import { QuizQuestionItem } from '../types/study';

interface QuizQuestionProps {
  question: QuizQuestionItem;
  questionNumber: number;
  totalQuestions: number;
  selectedOption: number | null;
  isSubmitted: boolean;
  formattedTime: string;
  onSelectOption: (index: number) => void;
  onSubmitAnswer: () => void;
  onNextQuestion: () => void;
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

export const QuizQuestion: React.FC<QuizQuestionProps> = ({
  question,
  questionNumber,
  totalQuestions,
  selectedOption,
  isSubmitted,
  formattedTime,
  onSelectOption,
  onSubmitAnswer,
  onNextQuestion,
}) => {
  const isLastQuestion = questionNumber === totalQuestions;

  return (
    <div className="w-full max-w-2xl mx-auto bg-white border border-navy-100 rounded-3xl p-6 sm:p-10 shadow-soft">
      {/* Top Meta Header: Question number & Timer */}
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-navy-100">
        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-50 text-brand-700 border border-brand-100">
            QUESTION {questionNumber} OF {totalQuestions}
          </span>
        </div>

        <div className="flex items-center space-x-1.5 text-xs font-mono font-medium text-navy-500 bg-navy-50 px-2.5 py-1 rounded-lg border border-navy-200">
          <Clock className="w-3.5 h-3.5 text-navy-400" />
          <span>{formattedTime}</span>
        </div>
      </div>

      {/* Question Prompt */}
      <h3 className="text-xl sm:text-2xl font-bold text-navy-900 leading-snug tracking-tight mb-8">
        {question.question}
      </h3>

      {/* Answer Options */}
      <div className="space-y-3 mb-8">
        {question.options.map((option, idx) => {
          const letter = OPTION_LETTERS[idx] || `${idx + 1}`;
          const isSelected = selectedOption === idx;
          const isCorrect = idx === question.correctAnswer;
          const isUserWrong = isSubmitted && isSelected && !isCorrect;
          const isUserCorrect = isSubmitted && isSelected && isCorrect;

          // Compute style classes depending on submission state
          let containerClasses = 'border-navy-200 bg-white hover:bg-navy-50/70 hover:border-navy-300';
          let letterClasses = 'bg-navy-100 text-navy-700 border-navy-200';

          if (isSubmitted) {
            if (isCorrect) {
              containerClasses = 'border-emerald-500 bg-emerald-50/80 ring-2 ring-emerald-500/20';
              letterClasses = 'bg-emerald-600 text-white border-emerald-600';
            } else if (isUserWrong) {
              containerClasses = 'border-rose-500 bg-rose-50/80 ring-2 ring-rose-500/20';
              letterClasses = 'bg-rose-600 text-white border-rose-600';
            } else {
              containerClasses = 'border-navy-100 bg-navy-50/40 opacity-50';
              letterClasses = 'bg-navy-100 text-navy-400 border-navy-200';
            }
          } else if (isSelected) {
            containerClasses = 'border-brand-600 bg-brand-50/60 ring-2 ring-brand-500/25';
            letterClasses = 'bg-brand-600 text-white border-brand-600';
          }

          return (
            <motion.div
              key={idx}
              whileHover={!isSubmitted ? { scale: 1.008 } : {}}
              whileTap={!isSubmitted ? { scale: 0.99 } : {}}
              onClick={() => onSelectOption(idx)}
              className={`w-full p-4 rounded-2xl border text-left flex items-start space-x-3.5 transition-all duration-200 cursor-pointer ${containerClasses}`}
            >
              {/* Option Letter Badge */}
              <div
                className={`w-7 h-7 rounded-xl border flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${letterClasses}`}
              >
                {isSubmitted && isCorrect ? (
                  <Check className="w-4 h-4" />
                ) : isSubmitted && isUserWrong ? (
                  <X className="w-4 h-4" />
                ) : (
                  letter
                )}
              </div>

              {/* Option Text */}
              <div className="flex-1 min-w-0 pt-0.5">
                <span
                  className={`text-sm sm:text-base leading-relaxed ${
                    isSubmitted && isCorrect
                      ? 'font-bold text-emerald-950'
                      : isSubmitted && isUserWrong
                      ? 'font-bold text-rose-950'
                      : isSelected
                      ? 'font-semibold text-brand-950'
                      : 'text-navy-800'
                  }`}
                >
                  {option}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Post-submission Educational Explanation Card */}
      {isSubmitted && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 sm:p-5 rounded-2xl border mb-8 text-left ${
            selectedOption === question.correctAnswer
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
              : 'bg-rose-50/70 border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-center space-x-2 font-bold text-sm mb-1.5">
            {selectedOption === question.correctAnswer ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Correct!</span>
              </>
            ) : (
              <>
                <X className="w-4 h-4 text-rose-600" />
                <span>
                  Incorrect. Correct answer is option {OPTION_LETTERS[question.correctAnswer]}.
                </span>
              </>
            )}
          </div>

          {question.explanation && (
            <p className="text-xs sm:text-sm leading-relaxed opacity-90 mt-1">
              {question.explanation}
            </p>
          )}
        </motion.div>
      )}

      {/* Footer Actions */}
      <div className="flex items-center justify-end space-x-3 pt-2">
        {!isSubmitted ? (
          <button
            type="button"
            onClick={onSubmitAnswer}
            disabled={selectedOption === null}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-semibold text-sm shadow-md shadow-brand-500/25 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
          >
            <span>Submit Answer</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onNextQuestion}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-navy-900 hover:bg-navy-950 text-white font-semibold text-sm shadow-md transition-all active:scale-95"
          >
            <span>{isLastQuestion ? 'View Final Results' : 'Next Question'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
