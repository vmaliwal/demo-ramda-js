import React from 'react'
import Calendar from 'react-calendar'
import moment from 'moment'
import * as R from 'ramda'


// default options
const payrollOptions = {
    startYear: '2019',
    maxYear: '2030',
    payDay: 4,
    payFrequency: 2, // EVERY 2 WEEKS
    totalPaychecks: {
        weekly: 52,
        biweekly: 26,
        monthly: 12,
    },
    payDates: []
}

const getStartDateOfPayrollByStartYear = (year) => {
    const startDate = 
    moment()
    .year(year)
    .startOf('year')
    .day(0).add('day', 1)
    .hour(0).minute(0).second(0)

    return startDate;
                    
}

// Returns a function that returns a date after 'n' weeks
const weeksFromDate = (weeks) => {
    return (date) => {
        return date.add('week', weeks)
        .hour(23).minute(59).second(59)
    }
}

// Returns a date after adding 'n' days
const addDaysToDate = (dayInNumber) => {
    return (date) => {
        return date.day(dayInNumber).clone()
    }
}

const twoWeeksFromDate = weeksFromDate(2)
const getPayDateAfterWorkingWeek = addDaysToDate(payrollOptions.payDay)

const firstPayDayOfYear = R.compose(getPayDateAfterWorkingWeek, twoWeeksFromDate, getStartDateOfPayrollByStartYear)

const nextPayDay = R.identity(twoWeeksFromDate)

// Checks if provided date is after start of the year, returns boolean
const isDateAfterStartDateOfYear = year => date => {        
    return moment(date).isAfter(moment(year))
}

// Format date in the acceptable format
const formatDate = date => date.clone().format('ddd MMM DD YYYY') 

// Calcualte PayDates only till few Years
const isMaxPayrollYearReached = isDateAfterStartDateOfYear(payrollOptions.maxYear)


const allPayDates = (date, payDates=[]) => {
    
    while(!isMaxPayrollYearReached(date)) {

        const dateToAdd = (payDates.length === 0) ? firstPayDayOfYear(payrollOptions.startYear) : nextPayDay(date)
        
        return allPayDates(dateToAdd, R.append(formatDate(dateToAdd), payDates))
    }


    return payDates

}

const arrContainsElement = arr => ele => {
    return (arr.indexOf(ele) !== -1)
}

const isPayDay = date => {

    let payDates = payrollOptions.payDates

    if(payDates === undefined || payDates.length === 0) {
        payDates = allPayDates()
        payrollOptions.payDates = payDates

    }
    const doesDateExist = arrContainsElement(payDates)

    return R.pipe(moment, formatDate, doesDateExist)(date)

} 


const markPayDate = ({date, view}) => {
    if (isPayDay(date) && view === 'month') {
        return '*'
    }
}

export default () => {
    return (
    <>
        <Calendar 
            tileContent={ markPayDate }
        />
    </>
    )

}