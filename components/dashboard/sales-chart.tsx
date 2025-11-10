"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts'

type SalesChartProps = {
    data: Array<{ day: string; sales: number }>
}

export function SalesChart({ data }: SalesChartProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Sales Overview</CardTitle>
                <CardDescription>Daily sales for the last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer
                    config={{
                        sales: {
                            label: "Sales",
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
                            <Bar dataKey="sales" fill="hsl(142, 76%, 36%)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
