import React, { useEffect, useState, useCallback } from "react";
import { HistoryCard } from "../../components/HistoryCard";
import { Container, Header, Title, Content, ChartContainer, MonthSelect, MonthSelectButton, MonthSelectIcon, Month } from "./styles";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { VictoryPie } from "victory-native";
import { categories } from "../../utils/categories";
import { useFocusEffect } from "@react-navigation/native";
import { RFValue } from "react-native-responsive-fontsize";
import { useTheme } from "styled-components";
import {useBottomTabBarHeight} from '@react-navigation/bottom-tabs';
import {addMonths , subMonths , format} from 'date-fns';
import {ptBR} from 'date-fns/locale'
import { LoadContainer } from "../Dashboard/styles";
import { ActivityIndicator } from "react-native";

interface TransactionData {
  type: "positive" | "negative";
  name: string;
  amount: string;
  category: string;
  date: string;
}
interface CategoryData {
  key: string;
  name: string;
  totalFormatted: string;
  total: number;
  color: string;
  icon: string;
  percentFormatted: string;
  percent: number;
}
export function Resume() {
  const theme = useTheme();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [totalByCategoriesState, setTotalByCategoriesState] = useState<
    CategoryData[]
  >([]);
  const [isLoading,setIsLoading] = useState(false);
  function handleDateChange(action : 'next' | 'prev'){
    if(action === 'next'){
      setSelectedDate(addMonths(selectedDate,1));
    }
    else {
      setSelectedDate(subMonths(selectedDate,1));
    }
  }

  async function loadData() {
    setIsLoading(true);
    const dataKey = "@gofinances:transactions";
    const response = await AsyncStorage.getItem(dataKey);
    const responseFormatted = response ? JSON.parse(response) : [];

    const expenses = responseFormatted.filter(
      (expense: TransactionData) => expense.type === "negative"      && 
      new Date(expense.date).getMonth() === selectedDate.getMonth() &&
      new Date ( expense.date).getFullYear() === selectedDate.getFullYear()
    );

    const expensesTotal = expenses.reduce(
      (accumulator: number, expense: TransactionData) => {
        return accumulator + Number(expense.amount);
      },
      0
    );

    console.log(expensesTotal);

    const totalByCategory: CategoryData[] = [];

    categories.forEach((category) => {
      let categorySum = 0;

      expenses.forEach((expense: TransactionData) => {
        if (expense.category === category.key) {
          categorySum += Number(expense.amount);
        }
      });
      if (categorySum > 0) {
        const totalFormatted = categorySum.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        });
        const percent = (categorySum / expensesTotal) * 100;
        const percentFormatted = `${percent.toFixed(0)}% `;

        totalByCategory.push({
          key: category.key,
          name: category.name,
          total: categorySum,
          totalFormatted: totalFormatted,
          color: category.color,
          icon: category.icon,
          percent: percent,
          percentFormatted: percentFormatted,
        });
      }
    });
    console.log(totalByCategory);
    setTotalByCategoriesState(totalByCategory);
    setIsLoading(false);
  }



  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [selectedDate])
  );
  return (
    <Container>
      <Header>
        <Title>Resumo por categoria</Title>
      </Header>
      {
        isLoading ? 
        <LoadContainer>
          <ActivityIndicator
          color = {theme.colors.primary}
          size = 'large'
          />
        </LoadContainer> :

      
      <Content
      showsVerticalScrollIndicator={false}
      contentContainerStyle = {{  paddingHorizontal : 24, paddingBottom: useBottomTabBarHeight() }}
      >
        <MonthSelect>
          <MonthSelectButton onPress = { () => handleDateChange('prev')}>
            <MonthSelectIcon name  ="chevron-left"/>
          </MonthSelectButton>
          <Month>
           {format(selectedDate, 'MMMM, yyyy',{locale: ptBR} )}
          </Month>
          <MonthSelectButton  onPress = { () => handleDateChange('next')}>
            <MonthSelectIcon name  ="chevron-right"/>
          </MonthSelectButton>
        </MonthSelect>
        <ChartContainer>
          <VictoryPie
            data={totalByCategoriesState}
            colorScale={totalByCategoriesState.map(
              (category) => category.color
            )}
            style={{
              labels: {
                fontSize: RFValue(18),
                fontWeight: "bold",
                fill: theme.colors.shape,
              },
            }}
            labelRadius={90}
            x="percentFormatted"
            y="total"
          />
        </ChartContainer>
        {totalByCategoriesState.map((item) => (
          <HistoryCard
            key={item.key}
            title={item.name}
            amount={item.totalFormatted}
            color={item.color}
            iconName={item.icon}
            iconColor={item.color}
          />
        ))}
      </Content>
}
    </Container>
  );
}
