import React from 'react'
import Calendar from 'react-calendar'
import moment from 'moment'
import * as R from 'ramda'


/**
 * Default
 */
const payrollOptions = {
    startYear: '2019',
    maxYear: '2030',
    payDates: [],
    payDay: 4 // THURSDAY
}

/**
 * @description Based on the year provided, get first day of the year
 * @param year - Year in integer or string
 * @returns A date of type moment
 */
const getStartDateOfPayrollByStartYear = year => {
    const startDate = 
    moment()
    .year(year)
    .startOf('year')
    .day(0).add('day', 1)
    .hour(0).minute(0).second(0)

    return startDate;
                    
}

/**
 * @description Add specified number of weeks to a given date
 * @param weeks - number of weeks in integer
 * @param date - a moment date
 * @returns A function that requires date parameter
 */
const weeksFromDate = weeks => date => {
    return date.add('week', weeks)
    .hour(23).minute(59).second(59)
}       

/**
 * @description Add number of days to given date
 * @param dayInNumber - Number of days in int
 * @param date - Moment date
 * @returns A curried function that accepts date parameter, that returns a moment date 
 * from specified number of days 
 */
const addDaysToDate = dayInNumber => date => {
    return date.day(dayInNumber).clone()
}


/**
 * @description Get 2 weeks from date for biweekly. this can easily be changed to support any number of weeks
 * @returns A function that takes date as parameter
 */
const twoWeeksFromDate = weeksFromDate(2)

/**
 * @description Next pay day after a working week.
 */
const getPayDateAfterWorkingWeek = addDaysToDate(payrollOptions.payDay)

/**
 * @description First pay day of the year.
 */
const firstPayDayOfYear = R.compose(getPayDateAfterWorkingWeek, twoWeeksFromDate, getStartDateOfPayrollByStartYear)

/**
 * @description A identity function of two weeks from date, for figuring out next pay day
 */
const nextPayDay = R.identity(twoWeeksFromDate)


/**
 * @description Checks if provided date is after start of the year
 * @param year - Is date after the start of the year provided year 
 * @returns Boolean value if the date is after the start date of provided year
 */

 const isDateAfterStartDateOfYear = year => date => {        
    return moment(date).isAfter(moment(year))
}

/**
 * @description Change date to default format
 * @param date - moment date to format 
 * @returns Moment date in default format
 */
const formatDate = date => date.clone().format('ddd MMM DD YYYY') 

/**
 * @description Check if max payroll year reached
 */
const isMaxPayrollYearReached = isDateAfterStartDateOfYear(payrollOptions.maxYear)


/**
 * @description Calculates all pay dates from the start year of payroll to the max year
 * @param date Date after the payroll date 
 * @param payDates Array that holds all calculated pay dates
 * @returns An array of dates as values. These dates represent pay dates
 */
const allPayDates = (date, payDates=[]) => {
    
    while(!isMaxPayrollYearReached(date)) {

        const dateToAdd = (payDates.length === 0) ? firstPayDayOfYear(payrollOptions.startYear) : nextPayDay(date)
        
        return allPayDates(dateToAdd, R.append(formatDate(dateToAdd), payDates))
    }
    
    return payDates
}

const memoizedPayDates = R.memoizeWith(R.identity, allPayDates)

/**
 * @description A curried function that checks if an element exist inside provided array
 * @param arr array of elements
 * @param ele element to check if it is part of the array
 * @returns Boolean value
 */
const arrContainsElement = arr => ele => {
    return (arr.indexOf(ele) !== -1)
}

/**
 * @description Ramda payDates lens 
 */
const lensPayDates = R.lensProp('payDates')

/**
 * @description Setter for pay dates
 */
const calculatePayDates = R.over(lensPayDates, memoizedPayDates, payrollOptions)

/**
 * @description Getter for pay dates array
 */
const calculatedPayDates = R.view(lensPayDates, calculatePayDates)

/**
 * @description Returns a curried function that accepts a date, to check if it is part of array
 */
const doesPayDateExist = arrContainsElement(calculatedPayDates)

/**
 * @description Checks if provided date is a pay day date
 * @param date - date in string format provided by react-calander
 * @returns boolean value if date is a pay date
 */
const isPayDay = date => {
    return R.pipe(moment, formatDate, doesPayDateExist)(date)
}

/**
 * @description Mark calander date with a start if date is pay date
 * @param param0 - React-calander object with date and view value
 * @returns returns '*' to show next to date on calander 
 */
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