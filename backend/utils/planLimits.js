const PLAN_LIMITS = {
  free:     { maxWishes:1, maxImages:5,  maxVideos:0,  hasMusic:false, hasAnimations:false, hasWatermark:true,  hostingDays:null, hasAI:false, hasCustomURL:false, hasAnalytics:false, hasPDF:false, hasComments:false, hasCountdown:false },
  silver:   { maxWishes:1, maxImages:20, maxVideos:0,  hasMusic:true,  hasAnimations:true,  hasWatermark:false, hostingDays:30,   hasAI:false, hasCustomURL:false, hasAnalytics:false, hasPDF:false, hasComments:false, hasCountdown:false },
  gold:     { maxWishes:5, maxImages:-1, maxVideos:3,  hasMusic:true,  hasAnimations:true,  hasWatermark:false, hostingDays:90,   hasAI:false, hasCustomURL:false, hasAnalytics:false, hasPDF:false, hasComments:true,  hasCountdown:true  },
  platinum: { maxWishes:-1,maxImages:-1, maxVideos:-1, hasMusic:true,  hasAnimations:true,  hasWatermark:false, hostingDays:-1,   hasAI:true,  hasCustomURL:true,  hasAnalytics:true,  hasPDF:true,  hasComments:true,  hasCountdown:true  },
};

const PLAN_PRICES = { silver: 3900, gold: 5900, platinum: 7900 };

module.exports = { PLAN_LIMITS, PLAN_PRICES };
