import SiteImage from "@/components/site/site-image";
import StarRating from "@/components/site/t2s/star-rating";
import { cn } from "@/lib/utils";
import type { ReviewItem } from "@/widgets/t2s-lib";

type Props = {
  review: ReviewItem;
  dark?: boolean;
  className?: string;
};

// Testimonial card: stars, title, body, then author row with an optional score.
const ReviewCard = ({ review, dark = false, className }: Props) => (
  <article
    className={cn("flex h-full flex-col gap-3 rounded-[var(--pp-radius-lg)] border p-5 md:p-6", className)}
    style={
      dark
        ? { background: "rgb(255 255 255 / 0.08)", borderColor: "rgb(255 255 255 / 0.14)" }
        : { background: "var(--pp-c-surface)", borderColor: "var(--pp-c-border)" }
    }
  >
    <StarRating rating={review.rating} />
    <h3 className="pp-heading text-base font-semibold leading-snug sm:text-lg">{review.title}</h3>
    <p className="pp-muted min-h-0 flex-1 text-sm leading-relaxed sm:text-[15px]">{review.body}</p>
    <div
      className="mt-auto flex items-center justify-between gap-3 border-t pt-4"
      style={{ borderColor: dark ? "rgb(255 255 255 / 0.14)" : "var(--pp-c-border)" }}
    >
      <span className="flex min-w-0 items-center gap-2">
        {review.avatar?.url ? (
          <SiteImage media={review.avatar} sizes="40px" className="h-8 w-8 shrink-0 rounded-full object-cover" />
        ) : null}
        <span className="truncate text-sm font-medium sm:text-base">{review.name}</span>
      </span>
      {review.score ? <span className="pp-muted shrink-0 text-sm font-medium">{review.score}</span> : null}
    </div>
  </article>
);

export default ReviewCard;
