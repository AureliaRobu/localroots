"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts'

type SpendingChartProps = {
    data: Array<{ day: string; spending: number }>
}

export function SpendingChart({ data }: SpendingChartProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Spending Overview</CardTitle>
                <CardDescription>Daily spending for the last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer
                    config={{
                        spending: {
                            label: "Spending",
                            color: "hsl(142, 76%, 36%)",
                        },
                    }}
                    className="h-[300px]"
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <XAxis dataKey="day" />
                            <YAxis />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar dataKey="spending" fill="hsl(142, 76%, 36%)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
