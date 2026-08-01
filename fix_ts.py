import os
import re

files_to_fix = [
    "frontend/src/App.tsx",
    "frontend/src/components/dashboard/AIInsights.tsx",
    "frontend/src/components/dashboard/GrowthPlan.tsx",
    "frontend/src/components/dashboard/HabitProgress.tsx",
    "frontend/src/components/dashboard/RecentReflection.tsx",
    "frontend/src/components/dashboard/Recommendations.tsx",
    "frontend/src/components/dashboard/StatCard.tsx",
    "frontend/src/components/layout/DashboardLayout.tsx",
    "frontend/src/components/layout/Header.tsx",
    "frontend/src/components/layout/Sidebar.tsx",
    "frontend/src/features/onboard/OnboardFlow.tsx",
    "frontend/src/pages/DashboardPage.tsx"
]

for file_path in files_to_fix:
    full_path = os.path.join(os.getcwd(), file_path)
    if not os.path.exists(full_path):
        continue
    with open(full_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Remove unused React import
    if "StatCard.tsx" in file_path or "DashboardLayout.tsx" in file_path:
        content = content.replace("import React, { ReactNode }", "import type { ReactNode }")
        content = content.replace("import React, {ReactNode}", "import type { ReactNode }")
    elif "OnboardFlow.tsx" in file_path or "Header.tsx" in file_path:
        content = content.replace("import React, {", "import {")
    else:
        content = re.sub(r"^import React from 'react';\n", "", content, flags=re.MULTILINE)
        
    # Specific fixes
    if "GrowthPlan.tsx" in file_path:
        content = content.replace("import { CheckCircle2, Circle, Clock, Loader2 }", "import { CheckCircle2, Loader2 }")
        
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content)

print("Fixed TS errors.")
