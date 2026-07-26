import type { Post } from '@/entities/post/types';
import type { PostCampaign } from '@/entities/post-campaign/types';

import { PostCard } from '@/features/linkedin-posts/components/post-list';

export function CampaignList({
  campaigns,
  posts,
}: {
  campaigns: PostCampaign[];
  posts: Post[];
}) {
  const nonEmptyCampaigns = campaigns.filter((campaign) =>
    posts.some((post) => post.campaignId === campaign.id),
  );

  if (nonEmptyCampaigns.length === 0) return null;

  return (
    <div className="flex flex-col gap-6">
      {nonEmptyCampaigns.map((campaign) => (
        <div key={campaign.id} className="flex flex-col gap-3">
          <div>
            <h3 className="text-lg font-semibold">{campaign.theme}</h3>
            <p className="text-sm text-muted-foreground">
              {campaign.createdAt.toLocaleDateString()}
            </p>
          </div>
          {posts
            .filter((post) => post.campaignId === campaign.id)
            .map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
        </div>
      ))}
    </div>
  );
}
