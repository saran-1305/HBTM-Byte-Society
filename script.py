import sys

with open('frontend/src/features/arc/ArcDashboardPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

arc_growth_start = content.find('          {/* ARC Growth Status */}')
recommendation_start = content.find('          {/* Recommendation Engine */}')
recommendation_end = content.find('        </div>\n      </div>\n    </DashboardLayout>')

if arc_growth_start > -1 and recommendation_start > -1:
    arc_growth_block = content[arc_growth_start:recommendation_start]
    recommendation_block = content[recommendation_start:recommendation_end]
    recommendation_block = recommendation_block.replace('<div className="space-y-12">', '<div className="space-y-12 mb-12">', 1)
    new_content = content[:arc_growth_start] + recommendation_block + arc_growth_block + content[recommendation_end:]
    
    with open('frontend/src/features/arc/ArcDashboardPage.tsx', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print('Swapped successfully.')
