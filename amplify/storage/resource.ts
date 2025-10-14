import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'SDXTeamImages',
  access: (allow) => ({
    'image-submissions/*': [
      allow.authenticated.to(['read','write']),
      allow.guest.to(['read', 'write'])
    ]
  })
});

export const secondBucket = defineStorage({
  name: 'secondBucket',
  access: (allow) => ({
    'private/{entity_id}/*': [
      allow.entity('identity').to(['read', 'write', 'delete'])
    ]
  })
});