
This file contains real user conversation examples for illustrating the Scoper methodology.

## Example 1: Maintenance Team Management (Problem-Solving, Urgent)

### Initial Input:
```
I am Gin, founder of Real estate agent in East London. My problem is how to manage my maintenaince team in the UK to work according to urgency priority for 20 houses needed to fix in 2 weeks. They don't know how to fix which houses first and I don't know how to guide them to prioritise workload based on emergency matter of tenants.
```

### Layer 1 Follow-up:
```
Layer 1: 
* Urgency like no electricity, boiler not working, no hot water, jammed lock will be more urgent like houses need to repaint 
* All occupied
```

### Layer 2 Follow-up:
```
Layer 2: 
Receive work via emergency phone call, whatsapp group 
Tenant will report via maintenance link on our website or email 
Tenants connected directly to maintenance team 
Team structure: There's one person Jay who manage 100 contractor builders (not company employees), but based on their availability to assign work and pricing quote. They have different specialty. 
Decision making pattern: Jay decide which job to do next 
Tenant will report via maintenance link on our website or email 
Bottleneck assessment: Tenant will be very angry if no hot water or broken boiler, and they will not recommend our services to other people 
Problem is that Jay don't know how to organise work and how to work with contractor, like no deadline is given clearly
```

### Layer 3 Follow-up:
```
I'll go with Option 3. 5 houses have urgent issue vs 15 houses non-urgent
```

## Example 2: B2C Channel Expansion (Idea-Execution, Discovery)

### Initial Input:
```
I'm Kien, founder of K&P Global Ltd which is a UK-based company specializing in international trade solutions and We offer three key services: Global Trade Advisory for optimizing international trade, Design Advisory for creative design consulting, and Contract Authorization for legal contract assurance. We connect markets, foster business partnerships, and drive sustainable growth and help them import- export furnitures. With a commitment to professionalism and reliability, we help businesses expand globally. Our website: https://www.knpglobal.co.uk/

I want to build B2C channel in the UK, before I only sell B2B.
```

### Layer 1 Follow-up:
```
Same products
I import furniture and selling directly to UK retailers
Reducing dependency on B2B relationships
```

### Layer 2 Follow-up:
```
Garden furniture
Have you gotten any signals that consumers would want these products - requests from end customers, or retailers mentioning consumer demand? => offtrack questions

Hold inventory in the UK
B2B: only sell more than 5 products, B2C: sell 1 product

Restriction: some products can only be sold to one buyer in the same market. No issues with existing retail customers
```

### Layer 3 Follow-up:
```
I want to choose all 3 metrics:
* Revenue diversification: B2C 50% to B2B 50%
* Customer acquisition: at least after 2 months, need to have orders from 10 customers.
* Operational validation: Average order value or fulfillment cost per B2C order?

Constraints:
Resources: I have a team to build my website to connect directly to B2C customers
Time: 10 hours per week
Budget: Marketing £700/ month, on Google, facebook and some other platforms
Risk tolerance: test small and scale up
```

## Example 3: Solo Founder Scaling (Problem-Solving, Difficult)

### Initial Input:
```
I'm Sarah, solo founder of a digital marketing consultancy. I've been running this for 2 years and have steady clients, but I'm completely overwhelmed. I'm working 70+ hours a week and turning down new clients because I can't handle more work. I know I need to hire and systematize, but I don't know where to start and I'm afraid of losing quality or client relationships.
```

### Expected Layer 1 Clarification:
- Goal type: Problem-solving (scaling bottleneck)
- Urgency: Difficult to solve (not immediate crisis, but blocking growth)
- Business matrix: Owner ↔ Company (leadership/systems) + Owner ↔ Employee (hiring/delegation)

## Example 4: Tech Startup Product Feature (Idea-Execution, Prototype)

### Initial Input:
```
I'm Alex, CTO of a 15-person SaaS startup. We've got product-market fit with our core platform, but customers keep asking for a mobile app. Our web app works on mobile browsers, but the experience isn't great. I'm trying to decide if we should build a native mobile app, improve our responsive web design, or create a PWA. We have 2 frontend developers and about 3 months before our biggest client contract renewal.
```

### Expected Layer 1 Clarification:
- Goal type: Idea-execution (new product feature)
- Stage: Prototype/MVP (building initial version)
- Business matrix: Employee ↔ Company (technical execution)

## Example 5: Restaurant Operations (Problem-Solving, Urgent)

### Initial Input:
```
I'm Maria, owner of a family restaurant. We've been struggling with food waste and inventory management. Last month we threw away $3,000 worth of food, and we're constantly running out of popular items while overstocking things that don't sell. Our food costs are 38% of revenue when they should be around 28-30%. We use a basic POS system but no real inventory tracking. I have 8 staff members including 2 cooks, and we're open 6 days a week.
```

### Expected Layer 1 Clarification:
- Goal type: Problem-solving (operational efficiency)
- Urgency: Urgent to solve (affecting cash flow)
- Business matrix: Owner ↔ Company (financial management) + Processes & Controls (inventory systems)

## Testing Scenarios

### Scenario A: Layer Progression
Test that the system correctly progresses through all 3 layers without skipping.

### Scenario B: Business Matrix Positioning
Test that different business types get correctly mapped to the 3x3 matrix.

### Scenario C: Goal Type Classification
Test that problem-solving vs idea-execution goals are correctly identified.

### Scenario D: Project Card Relevance
Test that generated project cards are contextually appropriate for the specific business situation.

### Scenario E: Metrics Adaptation
Test that success metrics are realistic for the team size and constraints mentioned.

## Edge Cases to Test

### Vague Initial Input:
```
I need help with my business. Things aren't working well and I'm stressed.
```
Expected: System should ask clarifying questions to extract specific challenges.

### Multiple Problems:
```
I have three major issues: cash flow problems, team communication issues, and our main competitor just launched a similar product.
```
Expected: System should help prioritize which problem to address first.

### Unrealistic Expectations:
```
I want to 10x my revenue in the next month without spending any money or hiring anyone.
```
Expected: System should acknowledge constraints and suggest realistic alternatives.

### Technical Jargon:
```
We need to implement a microservices architecture with Kubernetes orchestration to improve our API scalability and reduce latency in our real-time data processing pipeline.
```
Expected: System should translate technical goals into business impact and practical next steps.