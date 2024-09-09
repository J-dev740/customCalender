
'use client';
import { MdChevronLeft as ChevronLeftIcon, MdChevronRight as ChevronRightIcon } from 'react-icons/md'
import { GoChevronDown } from 'react-icons/go'
import { TiTick } from 'react-icons/ti'
import {
    add,
    addDays,
    addMonths,
    addWeeks,
    addYears,
    differenceInWeeks,
    eachDayOfInterval,
    endOfMonth,
    endOfWeek,
    format,
    getDate,
    getDay,
    getISOWeek,
    getMonth,
    getWeek,
    isEqual,
    isSameDay,
    isSameMonth,
    isSaturday,
    isSunday,
    isToday,
    parse,
    parseISO,
    startOfMonth,
    startOfToday,
    startOfWeek,
} from 'date-fns'
import { Fragment, useEffect, useState } from 'react'

interface reccuranceInterface {
    pattern?: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'None' | 'weekdays';
    every?: number,
    weekDays?: string[],
    monthDays?: number[],
    nthWeekdayofMonth?: { nth: number, weekday: string };
    specificDateOfYear?: { month: number, day: number };
    nthWeekdayOfYear?: { nth: number, weekday: string, month: number };
    startDate?: Date

}
const initialstate = {}

function classNames(...classes: any) {
    return classes.filter(Boolean).join(' ')
}

export default function DatePicker() {
    const millisecondsInDay = 24 * 60 * 60 * 1000;
    let today = startOfToday()
    let [reccOptions, setReccOptions] = useState<reccuranceInterface>({});
    let [selectedDay, setSelectedDay] = useState<Date>(today)
    let [selectedDaysub, setSelectedDaysub] = useState<Date>(today)


    let [dropdown, setDropDown] = useState<any>({});
    let [remOpen, setRemOpen] = useState(false);
    let [customoption, setCustomOption] = useState<'day' | 'week' | 'month' | 'year'>('day');
    let [variation, setVariation] = useState<'MEach' | 'MonThe' | 'YEach' | 'YonThe' | 'None'>('None')
    let [customOpen, setCustomOpen] = useState(false);
    let [previewDates, setPreviewDates] = useState<Set<String>>(new Set())
    let [currentMonth, setCurrentMonth] = useState(format(today, 'MMM-yyyy'))
    let [subcurrentMonth, setSubcurrentMonth] = useState(format(today, 'MMM-yyyy'));
    let [customDrop, setCustomDrop] = useState(false);
    let firstDayCurrentMonth = parse(currentMonth, 'MMM-yyyy', new Date())
    let firstDaySubCurrentMonth = parse(subcurrentMonth, 'MMM-yyyy', new Date());

    useEffect(() => {
        setReccOptions({});
        setPreviewDates(new Set());
        setCustomDrop(false);
        setCustomOpen(false);
        setRemOpen(false);
        setDropDown((prev: any) => ({ ...prev, ['d1']: false, ['d2']: false, ['d3']: false, ['d4']: false, ['d5']: false }));
        setCustomOption('day')
        setVariation('None')
    }, [selectedDay])

    function getPreview(recurrance: reccuranceInterface): Date[] {

        let pDates: Date[] = [];
        let firstDayCurrentMonth = parse(currentMonth, 'MMM-yyyy', new Date())
        let firstDayPreviousMonth = startOfMonth(addMonths(firstDayCurrentMonth, -1))
        const nextMonth = startOfMonth(addMonths(firstDayCurrentMonth, 1));
        // const monthRangeStart=firstDayCurrentMonth;
        const monthRangeStart = firstDayPreviousMonth;
        const monthRangeEnd = endOfMonth(nextMonth);
        switch (recurrance.pattern) {
            case 'daily':
                pDates = getDaily(monthRangeStart, monthRangeEnd, recurrance.every || 1);
                break;
            case 'weekly':
                pDates = getWeekly(monthRangeStart, monthRangeEnd, recurrance.every || 1, recurrance.weekDays || []);
                break;
            case 'monthly':
                if (recurrance.monthDays) {
                    // console.log('wrong')
                    pDates = getMonthly(monthRangeStart, monthRangeEnd, recurrance.every || 1, recurrance.monthDays);
                }
                else if (recurrance.nthWeekdayofMonth) {
                    // console.log('right')
                    pDates = getMonthlyNthDay(monthRangeStart, monthRangeEnd, recurrance.every || 1, recurrance.nthWeekdayofMonth);
                }
                break;

            case 'yearly':
                if (recurrance.specificDateOfYear)
                    pDates = getYearly(monthRangeStart, monthRangeEnd, recurrance.every || 1, recurrance.specificDateOfYear);
                else if (recurrance.nthWeekdayOfYear)
                    pDates = getNthWeekdayYearlyDates(monthRangeStart, monthRangeEnd, recurrance.every || 1, recurrance.nthWeekdayOfYear);

                break;
            case 'weekdays':
                pDates = getEveryWeekDays(monthRangeStart, monthRangeEnd, recurrance.every || 1);
                break;
            case 'None':
                pDates = [selectedDay];
                break;
            default:
                break;
        }

        return pDates.filter((date: Date) => date >= selectedDay && date <= monthRangeEnd);

    }
    function DatesInRange(start: Date, end: Date, IncrementFunction: Function): Date[] {

        let dates = [];
        let current = start;
        while (current <= end) {
            dates.push(current);
            current = IncrementFunction(current);
        }
        return dates;

    }
    function getDaily(start: Date, end: Date, every: number): Date[] {
        return DatesInRange(start, end, (date: Date) => addDays(date, 1)).filter((date: Date) => {
            let daysSinceStart = Math.floor((date.getTime() - selectedDay.getTime()) / millisecondsInDay);
            return (daysSinceStart >= 0 && daysSinceStart % every == 0);
        });
    }
    function getWeekly(start: Date, end: Date, every: number, weekDays: string[]): Date[] {
        let dates: Date[] = [];
        let st = new Set(weekDays)
        let curr = start;
        while (curr <= end) {
            let weeksSinceStart = differenceInWeeks(startOfWeek(curr), startOfWeek(selectedDay))
            if (weeksSinceStart >= 0 && weeksSinceStart % every == 0 && st.has(format(curr, 'EEEE'))) {

                console.log('current day', format(curr, 'MMM-do'), 'weeksincestart', weeksSinceStart)
                dates.push(curr);
            }
            curr = addDays(curr, 1);
        }
        return dates;
    }
    function getMonthly(start: Date, end: Date, every: number, monthDays: number[]) {
        // console.log('month days',monthDays)

        let ar = DatesInRange(start, end, (date: Date) => addDays(date, 1))
        let st = new Set(monthDays.map((day) => Math.min(getDate(endOfMonth(parse(currentMonth, 'MMM-yyyy', new Date()))), day)));

        console.log('month days correct set', st)


        return ar.filter((date: Date) => {
            const monthsSinceStart = (date.getFullYear() - selectedDay.getFullYear()) * 12 +
                (date.getMonth() - selectedDay.getMonth());
            return (monthsSinceStart % every == 0 && st.has(getDate(date)));
        })

    }
    function getMonthlyNthDay(start: Date, end: Date, every: number, nthWeekdayOfMonth: { nth: number, weekday: string }): Date[] {
        let dates: Date[] = [];
        let current = start;
        while (current <= end) {
            const monthsSinceStart = (current.getFullYear() - selectedDay.getFullYear()) * 12 +
                (current.getMonth() - selectedDay.getMonth());
            if (monthsSinceStart >= 0 && monthsSinceStart % every == 0) {
                const nthweekday = nthWeekdayInMonth(current, nthWeekdayOfMonth.nth, nthWeekdayOfMonth.weekday);
                if (nthweekday && nthweekday >= start && nthweekday <= end) {
                    dates.push(nthweekday);
                }
            }
            current = addMonths(current, 1);
            current = startOfMonth(current);
        }

        return dates;
    }
    function nthWeekdayInMonth(date: Date, nth: number, weekday: string): Date | null {
        let count = 0;
        let currentDate = startOfMonth(date);
        while (getMonth(currentDate) === getMonth(date)) {
            if (format(currentDate, 'EEEE') === weekday) {
                count++;
                if (count === nth) {
                    return currentDate;
                }
            }
            currentDate = addDays(currentDate, 1);
        }
        return null;
    }
    function getYearly(start: Date, end: Date, every: number, specificDateOfYear: { month: number, day: number }): Date[] {
        let dates: Date[] = [];
        let current = start;

        while (current <= end) {
            const yearsSinceStart = current.getFullYear() - selectedDay.getFullYear();
            if (yearsSinceStart >= 0 && yearsSinceStart % every == 0) {
                if (getMonth(current) == specificDateOfYear.month) {
                    let specificDate = new Date(current.getFullYear(), specificDateOfYear.month, specificDateOfYear.day);
                    dates.push(specificDate);
                }
            }
            current = addMonths(current, 1);
        }




        return dates;
    }
    function getNthWeekdayYearlyDates(start: Date, end: Date, every: number, nthWeekdayOfYear: { nth: number, weekday: string, month: number }): Date[] {
        let dates = [];
        let currentDate = start;
        while (currentDate <= end) {
            const yearsSinceStart = currentDate.getFullYear() - selectedDay.getFullYear();
            if (yearsSinceStart >= 0 && yearsSinceStart % every == 0 && getMonth(currentDate) == nthWeekdayOfYear.month) {
                const nthWeekday = nthWeekdayInMonth(new Date(currentDate.getFullYear(), nthWeekdayOfYear.month, 1), nthWeekdayOfYear.nth, nthWeekdayOfYear.weekday);
                if (nthWeekday && nthWeekday >= start && nthWeekday <= end) {
                    dates.push(nthWeekday);
                }

            }
            currentDate = addMonths(currentDate, 1);
        }
        return dates;
    }
    function getEveryWeekDays(start: Date, end: Date, every: number) {
        return DatesInRange(start, end, (date: Date) => addDays(date, 1)).filter((date: Date) => {
            return !isSunday(date) && !isSaturday(date);
        })
    }
    useEffect(() => {
        console.log(reccOptions)
        console.log('selected Day', selectedDay)
        if (JSON.stringify(reccOptions) !== '{}') {
            let pdates = (getPreview(reccOptions).map((v) => v.toString()))
            pdates.push(selectedDay.toString());
            let st = new Set(pdates);
            setPreviewDates(st);
        } else {
            setPreviewDates(new Set([selectedDay.toString()]));
        }
        // console.log(getPreview(reccOptions));

        // todo generate preview based on change in selected day , and reccuringOptions
    }, [reccOptions, currentMonth])

    let days: Date[] = eachDayOfInterval({
        start: startOfWeek(firstDayCurrentMonth),
        end: endOfWeek(endOfMonth(firstDayCurrentMonth)),
    })
    let YearOptiondays: Date[] = eachDayOfInterval({
        start: startOfWeek(firstDaySubCurrentMonth),
        end: endOfWeek(endOfMonth(firstDaySubCurrentMonth)),
    })
    function subpreviousMonth() {
        let firstDayNextMonth = add(firstDaySubCurrentMonth, { months: -1 })
        setSubcurrentMonth(format(firstDayNextMonth, 'MMM-yyyy'))
    }
    function subnextMonth() {
        let firstDayNextMonth = add(firstDaySubCurrentMonth, { months: 1 })
        setSubcurrentMonth(format(firstDayNextMonth, 'MMM-yyyy'))
    }
    function previousMonth() {
        let firstDayNextMonth = add(firstDayCurrentMonth, { months: -1 })
        setCurrentMonth(format(firstDayNextMonth, 'MMM-yyyy'))
    }

    function nextMonth() {
        let firstDayNextMonth = add(firstDayCurrentMonth, { months: 1 })
        setCurrentMonth(format(firstDayNextMonth, 'MMM-yyyy'))
    }
    useEffect(() => {
        console.log('previewDates', previewDates)

    }, [previewDates])
    return (
        <div className="pt-16 ">
            <div className="max-w-md px-4 mx-auto sm:px-7 md:max-w-4xl md:px-6 ">
                {/* covering div */}
                <div className="md:grid md:grid-cols-2 md:divide-x  md:divide-gray-200">
                    {/* calender div  */}
                    <div className="md:pr-14">
                        {/* mmm-yyyy header */}
                        <div className="flex items-center">
                            <h2 className="flex-auto font-semibold text-gray-900">
                                {format(firstDayCurrentMonth, 'MMMM yyyy')}
                            </h2>
                            <button
                                type="button"
                                onClick={previousMonth}
                                className="-my-1.5 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500"
                            >
                                <span className="sr-only">Previous month</span>
                                <div className="w-5 h-5" aria-hidden="true">
                                    <ChevronLeftIcon />
                                </div>
                            </button>
                            <button
                                onClick={nextMonth}
                                type="button"
                                className="-my-1.5 -mr-1.5 ml-2 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500"
                            >
                                <span className="sr-only">Next month</span>
                                <div className="w-5 h-5" aria-hidden="true">
                                    <ChevronRightIcon />
                                </div>
                            </button>
                        </div>
                        {/* weekday div */}
                        <div className="grid grid-cols-7 mt-10 text-xs leading-6 text-center text-gray-500">
                            <div>S</div>
                            <div>M</div>
                            <div>T</div>
                            <div>W</div>
                            <div>T</div>
                            <div>F</div>
                            <div>S</div>
                        </div>
                        {/* mini-calender day div */}
                        <div className="grid grid-cols-7 mt-2 text-sm">
                            {days.length > 0 && days.map((day: Date, dayIdx: number) => (
                                <div
                                    key={day.toString()}
                                    className={classNames(
                                        (dayIdx == 0 && colStartClasses[getDay(day)]),
                                        'py-1.5'
                                    )}
                                >
                                    <button
                                        type="button"
                                        onClick={() => {

                                            setSelectedDay(day)
                                        }}
                                        className={classNames(
                                            isEqual(day, selectedDay) && 'text-white',
                                            !isEqual(day, selectedDay) &&
                                            isToday(day) &&
                                            'text-red-500',
                                            !isEqual(day, selectedDay) &&
                                            !isToday(day) &&
                                            isSameMonth(day, firstDayCurrentMonth) &&
                                            'text-gray-900',
                                            !isEqual(day, selectedDay) &&
                                            !isToday(day) &&
                                            !isSameMonth(day, firstDayCurrentMonth) &&
                                            'text-gray-400',
                                            isEqual(day, selectedDay) && isToday(day) && 'bg-red-500',
                                            previewDates.has(day.toString()) && 'bg-cyan-400',
                                            isEqual(day, selectedDay) &&
                                            !isToday(day) &&
                                            'bg-gray-900',
                                            !isEqual(day, selectedDay) && 'hover:bg-gray-200',
                                            (isEqual(day, selectedDay) || isToday(day)) &&
                                            'font-semibold',
                                            'mx-auto flex h-8 w-8 items-center justify-center rounded-full'
                                        )}
                                    >
                                        <time dateTime={format(day, 'yyyy-MM-dd')}>
                                            {format(day, 'd')}
                                        </time>
                                    </button>


                                </div>
                            ))}
                        </div>
                        {/* remainder div  */}
                        <div
                            onClick={() => setRemOpen(!remOpen)}
                            className='relative flex flex-row hover:cursor-pointer w-full text-black items-center rounded-xl mt-2 p-2 bg-gray-200 justify-between py-2 px-1'>
                            <span className='text-slate-900  text-normal font-mono text-start w-full pl-4 '>Repeat</span>
                            <button
                                type='button'
                                className='text-[20px]'>
                                {!remOpen ? <ChevronRightIcon /> : <GoChevronDown />}
                            </button>
                            {/* recurring options */}
                            {remOpen && (
                                <ul className='absolute ring-[1px] ring-black flex flex-col gap-2 items-start justify-start  bottom-full bg-white   w-[97%]   justify-self-center   py-4 shadow-md shadow-black rounded-lg  h-fit'>
                                    <li onClick={() => {
                                        setReccOptions({ pattern: 'daily' })
                                    }}
                                        className='flex hover:cursor-pointer hover:bg-slate-200 w-full rounded-lg pl-4 py-1'>Daily
                                    </li>
                                    <li onClick={() => {
                                        setReccOptions({ pattern: 'weekly', weekDays: [format(selectedDay, 'EEEE')], every: 1 })
                                    }}
                                        className='flex hover:cursor-pointer hover:bg-slate-200 w-full rounded-lg  pl-4  py-1'>Weekly
                                        <span className='text-gray-600 font-light pl-2'>
                                            ({format(selectedDay, 'EEEE')})
                                        </span>
                                    </li>
                                    <li onClick={() => {
                                        setReccOptions({ pattern: 'monthly', monthDays: [getDate(selectedDay), 29, 30, 31] })
                                    }}
                                        className='flex hover:cursor-pointer hover:bg-slate-200 w-full rounded-lg pl-4 py-1'>
                                        Monthly
                                        <span className='text-gray-600 font-light pl-2'>
                                            ({format(selectedDay, 'do')})
                                        </span>
                                    </li>
                                    <li onClick={() => {
                                        setReccOptions({ pattern: 'yearly', specificDateOfYear: { month: getMonth(selectedDay), day: getDate(selectedDay) } })
                                    }} className='flex hover:cursor-pointer hover:bg-slate-200 w-full rounded-lg pl-4 py-1'>Yearly
                                        <span className='text-gray-600 font-light pl-2'>
                                            ({format(selectedDay, 'LLL')} {format(selectedDay, 'do')})
                                        </span>
                                    </li>
                                    <li onClick={() => {
                                        setReccOptions({ pattern: 'weekdays' })
                                    }}
                                        className='flex hover:cursor-pointer hover:bg-slate-200 w-full rounded-lg pl-4 py-1'>Every WeekDays
                                        <span className='text-gray-600 font-light pl-2'>
                                            (Mon-Fri)
                                        </span>
                                    </li>
                                    <li
                                        onClick={() => {
                                            setReccOptions({ pattern: 'daily', every: 1 });
                                            setCustomOpen(true)
                                        }
                                        }
                                        className='flex hover:cursor-pointer hover:bg-slate-200 w-full rounded-lg pl-4 py-1'>Custom</li>

                                </ul>
                            )}
                            {/* cusom recurring options */}
                            {customOpen && (
                                <div
                                    onClick={(e) => e.stopPropagation()}
                                    className='absolute z-10 ring-1 ring-black top-0 w-full h-fit  rounded-md bg-white'>
                                    {/* custom div */}
                                    <div className='flex flex-col  w-full h-fit '>
                                        {/* every and interval selection */}
                                        <div className='flex flex-row w-full  p-2 items-center justify-between '>
                                            <span className='flex bg-gray-300 gap-x-2  rounded-md text-black flex-row items-center justify-start w-fit px-2 py-1'>
                                                <p>Every</p>
                                                <input
                                                    defaultValue={1}
                                                    min={1}

                                                    onChange={(e) => {
                                                        setReccOptions((prev: any) => ({ ...prev, every: Number(e.target.value) }))
                                                    }}
                                                    className=' flex max-w-10 w-fit h-4 rounded-sm ring-1 ring-black  mx-2 my-1 px-2 text-center outline-none bg-transparent' />
                                            </span>
                                            <div
                                                onMouseDown={() => {
                                                    setCustomDrop(!customDrop)
                                                }}
                                                className=' relative flex flex-row w-fit  ring-[1px] ring-black rounded-md   items-center justify-between   px-4 gap-x-2 '>{customoption}
                                                <button
                                                    type='button'
                                                    className='text-[20px]'>
                                                    {!customDrop ? <ChevronRightIcon /> : <GoChevronDown />}
                                                </button>
                                                {customDrop && (
                                                    <ul className='absolute z-20 bg-white flex w-[96%] left-0 rounded-md ring-1 ring-black bottom-full flex-col items-center justify-center '>
                                                        <li
                                                            onMouseDown={() => {
                                                                setReccOptions((prev: any) => ({ every: prev.every, pattern: 'daily' }))
                                                                setCustomOption('day')
                                                            }}
                                                            className='flex flex-row items-center justify-between w-full  hover:cursor-pointer hover:bg-gray-300 rounded-md text-start p-2 pl-2 '> Day
                                                            <span className={customoption == 'day' ? 'flex text-blue-600' : 'hidden'}><TiTick /></span>
                                                        </li>
                                                        <li
                                                            onMouseDown={() => {
                                                                console.log('dayof wekk', dayofWeek[getDay(selectedDay)])
                                                                setReccOptions((prev: any) => ({ every: prev.every, pattern: 'weekly', weekDays: [dayofWeek[getDay(selectedDay)]] }))
                                                                setCustomOption('week')
                                                            }}
                                                            className='flex flex-row items-center justify-between w-full  hover:cursor-pointer hover:bg-gray-300 rounded-md text-start p-2 pl-2 '> Week
                                                            <span className={customoption == 'week' ? 'flex text-blue-600' : 'hidden'}><TiTick /></span>
                                                        </li>                            <li
                                                            onMouseDown={() => {
                                                                setReccOptions((prev: any) => ({ every: prev.every, pattern: 'monthly', monthDays: [getDate(selectedDay)] }))
                                                                setVariation('MEach');
                                                                setCustomOption('month');
                                                            }}
                                                            className='flex flex-row items-center justify-between w-full  hover:cursor-pointer hover:bg-gray-300 rounded-md text-start p-2 pl-2 '> Month
                                                            <span className={customoption == 'month' ? 'flex text-blue-600' : 'hidden'}><TiTick /></span>
                                                        </li>                            <li
                                                            onMouseDown={() => {
                                                                setReccOptions((prev: any) => ({ every: prev.every, pattern: 'yearly' }))
                                                                setCustomOption('year')
                                                            }}
                                                            className='flex flex-row items-center justify-between w-full  hover:cursor-pointer hover:bg-gray-300 rounded-md text-start p-2 pl-2 '> Year
                                                            <span className={customoption == 'year' ? 'flex text-blue-600' : 'hidden'}><TiTick /></span>
                                                        </li>


                                                    </ul>
                                                )}
                                            </div>
                                        </div>

                                        {/*conditional  render based on interval */}
                                        <div className='flex w-full h-fit '>
                                            {(() => {
                                                switch (customoption) {
                                                    case 'day':
                                                        return <div>
                                                       
                                                        </div>
                                                    case 'week':
                                                        return (
                                                            <div className="  w-full flex-row grid grid-cols-7  p-2  text-md leading-6 text-center text-gray-500">
                                                                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((v, idx) => {

                                                                    return (
                                                                        <div
                                                                            key={idx}
                                                                            onClick={() => {
                                                                                let ar = reccOptions.weekDays || [];
                                                                                if (reccOptions.weekDays?.includes(dayofWeek[idx])) {

                                                                                    setReccOptions((prev: any) => ({ ...prev, weekDays: (ar.filter(val => val !== dayofWeek[idx]) || []) }))
                                                                                } else {
                                                                                    ar.push(dayofWeek[idx])
                                                                                    setReccOptions((prev: any) => ({ ...prev, weekDays: ar }));
                                                                                }
                                                                            }}
                                                                            className={classNames(
                                                                                (reccOptions.weekDays || []).includes(dayofWeek[idx]) && 'bg-cyan-500 ring-2 ring-black hover:bg-cyan-500',
                                                                                'flex p-2 rounded-full bg-slate-200 hover:bg-blue-300 text-center w-8 h-8 items-center justify-center')}>{v}</div>

                                                                    )
                                                                })}

                                                            </div>
                                                        )


                                                    case 'month':
                                                        return <div className='flex w-full items-center h-fit flex-col p-1'>
                                                            {/* each and on the options */}
                                                            <div className='mx-2 rounded-md ring-[1px] ring-black bg-gray-200 flex flex-row items-center justify-between w-fit '>
                                                                <span
                                                                    onClick={() => {
                                                                        setReccOptions((prev: any) => ({ every: prev.every, pattern: 'monthly', monthDays: [getDate(selectedDay)] }))
                                                                        setVariation('MEach')
                                                                    }}
                                                                    className={classNames(
                                                                        variation == 'MEach' && 'px-2 bg-white rounded-md ring-[1px] ring-black   text-black ', 'px-2 hover:cursor-pointer flex text-black'
                                                                    )}>
                                                                    Each
                                                                </span>
                                                                <span
                                                                    onClick={() => {
                                                                        if (variation !== 'MonThe')
                                                                            setReccOptions((prev: any) => ({ every: prev.every, pattern: 'monthly', nthWeekdayofMonth: { nth: 1, weekday: format(selectedDay, "EEEE") } }));
                                                                        setVariation('MonThe')
                                                                    }}
                                                                    className={classNames(
                                                                        variation == 'MonThe' && 'bg-white rounded-md ring-[1px] ring-black  text-black', 'px-2 hover:cursor-pointer flex text-black'
                                                                    )}>
                                                                    On The
                                                                </span>

                                                            </div>

                                                            {/* 31 days of month to select  or to select nth weekday based on option */}
                                                            <div className={classNames(
                                                                variation == 'MEach' && 'flex',
                                                                variation !== 'MEach' && 'hidden',
                                                                'mt-2 grid grid-cols-7  grid-flow-row  justify-start gap-x-1 w-full gap-y-2 ')}>
                                                                {Array(31).fill(0).map((_, idx) => {
                                                                    return <button
                                                                        onClick={() => {
                                                                            if (!reccOptions.monthDays?.includes(idx + 1)) setReccOptions((prev: any) => ({ ...prev, monthDays: [...(prev.monthDays || []), idx + 1] }))
                                                                            else setReccOptions((prev: any) => ({ ...prev, monthDays: [...(prev.monthDays || [])].filter((v: number) => v !== idx + 1) }))
                                                                        }}
                                                                        className={classNames(
                                                                            (reccOptions.monthDays||[]).includes(idx + 1) && 'bg-cyan-400 ring-2 ring-black',
                                                                            ' text-center flex items-center justify-center text-black h-8  hover:bg-blue-500  w-8 p-2 rounded-full bg-gray-100')}>
                                                                        {idx + 1}
                                                                    </button>
                                                                })}
                                                            </div>
                                                            {/* nth weekday for Every nth Month  */}
                                                            <div className={classNames(
                                                                variation !== 'MonThe' && 'hidden',
                                                                'flex   flex-row w-full items-start mt-2 justify-center h-fit min-h-2')}>
                                                                {/* nth & weekday */}
                                                                <div className='flex mt-2 w-full mx-2 flex-row  justify-center gap-x-4 items-center p-1'>
                                                                    <div
                                                                        onMouseDown={() => {
                                                                            // if(!dropdown['d1'] || dropdown['d1']==false){
                                                                            // }
                                                                            setDropDown((prev: any) => ({ ...prev, ['d1']: !prev['d1'] }))
                                                                        }}
                                                                        className=' relative flex flex-row w-fit  rounded-md ring-[1px] ring-black   items-center justify-between   px-2 gap-x-3 '>{(reccOptions?.nthWeekdayofMonth?.nth) ?? 1}
                                                                        <button
                                                                            type='button'
                                                                            className='flex w-fit text-[20px]'>
                                                                            {!dropdown['d1'] ? <ChevronRightIcon /> : <GoChevronDown />}
                                                                        </button>
                                                                        {dropdown['d1'] && (
                                                                            <ul className='absolute z-20 bg-white flex w-fit  pr-8 pl-2 left-0 rounded-md ring-1 ring-black top-full flex-col items-center justify-center '>
                                                                                {['first', 'second', 'third', 'fourth', 'fifth'].map((v, idx) => {
                                                                                    return <li
                                                                                        key={idx}
                                                                                        onMouseDown={() => {
                                                                                            // setDropDown((prev:any)=>({...prev,['d1']:!prev['d1']}))
                                                                                            setReccOptions((prev: any) => ({ ...prev, nthWeekdayofMonth: { ...prev.nthWeekdayofMonth, nth: idx + 1 } }))

                                                                                        }}
                                                                                        // value={'day'}
                                                                                        className='flex flex-row items-center justify-between w-full  hover:cursor-pointer hover:bg-gray-300 rounded-md text-start p-2 pl-2 '>{v}
                                                                                        <span className={reccOptions.nthWeekdayofMonth?.nth == idx + 1 ? 'flex text-blue-600' : 'hidden'}><TiTick /></span>
                                                                                    </li>

                                                                                })}

                                                                            </ul>
                                                                        )}
                                                                    </div>
                                                                    <div
                                                                        onMouseDown={() => {
                                                                            setDropDown((prev: any) => ({ ...prev, ['d2']: !prev['d2'] }));
                                                                            // if(dropdown['d2']) setReccOptions({pattern:'monthly',})
                                                                        }}
                                                                        className=' relative flex flex-row w-fit rounded-md ring-[1px] ring-black    items-center justify-between   px-4 gap-x-2 '>{reccOptions?.nthWeekdayofMonth?.weekday}
                                                                        <button
                                                                            type='button'
                                                                            className='text-[20px]'>
                                                                            {!dropdown['d2'] ? <ChevronRightIcon /> : <GoChevronDown />}
                                                                        </button>
                                                                        {dropdown['d2'] && (
                                                                            <ul className='absolute z-20 bg-white flex w-fit  pr-8 pl-2 left-0 rounded-md ring-1 ring-black bottom-full flex-col items-center justify-center '>
                                                                                {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((v, idx) => {
                                                                                    return <li
                                                                                        key={idx}
                                                                                        onMouseDown={() => {
                                                                                            // setDropDown((prev:any)=>({...prev,['d1']:!prev['d1']}))
                                                                                            setReccOptions((prev: any) => ({ ...prev, nthWeekdayofMonth: { ...prev.nthWeekdayofMonth, weekday: v } }))


                                                                                        }}
                                                                                        // value={'day'}
                                                                                        className='flex flex-row items-center justify-between w-full  hover:cursor-pointer hover:bg-gray-300 rounded-md text-start p-2 pl-2 '>{v}
                                                                                        <span className={reccOptions?.nthWeekdayofMonth?.weekday == v ? 'flex text-blue-600' : 'hidden'}><TiTick /></span>
                                                                                    </li>

                                                                                })}

                                                                            </ul>
                                                                        )}

                                                                    </div>

                                                                </div>

                                                            </div>


                                                        </div>

                                                    case 'year':

                                                        return <div className='flex w-full items-center h-fit flex-col p-1'>
                                                            {/* each and on the options */}
                                                            <div className='mx-2 rounded-md ring-[1px] ring-black bg-gray-200 flex flex-row items-center justify-between w-fit '>
                                                                <span
                                                                    onClick={() => {
                                                                        setReccOptions((prev: any) => ({ every: prev.every, pattern: 'yearly', specificDateOfYear: { month: getMonth(subcurrentMonth), day: getDate(firstDaySubCurrentMonth) } }))
                                                                        setSelectedDaysub(today)
                                                                        setVariation('YEach')
                                                                    }}
                                                                    className={classNames(
                                                                        variation == 'YEach' && 'px-2 bg-white ring-[1px] ring-black rounded-md text-black ', 'px-2 hover:cursor-pointer flex text-black'
                                                                    )}>
                                                                    Each
                                                                </span>
                                                                <span
                                                                    onClick={() => {
                                                                        if (variation !== 'YonThe')
                                                                            setReccOptions((prev: any) => ({ every: prev.every, pattern: 'yearly', nthWeekdayOfYear: { nth: 1, weekday: format(selectedDay, "EEEE"), month: getMonth(firstDaySubCurrentMonth) } }));
                                                                        setVariation('YonThe')
                                                                    }}
                                                                    className={classNames(
                                                                        variation == 'YonThe' && 'bg-white rounded-md  text-black', 'px-2 hover:cursor-pointer flex text-black'
                                                                    )}>
                                                                    On The
                                                                </span>

                                                            </div>
                                                            {variation == 'YEach' && <div className='flex flex-col w-full mt-2'>
                                                                {/* mmm-yyyy header */}
                                                                <div className="flex items-center">
                                                                    <h2 className="flex-auto font-normal pl-4 text-[14px] text-gray-900">
                                                                        {format(firstDaySubCurrentMonth, 'MMMM ')}
                                                                    </h2>
                                                                    <button
                                                                        type="button"
                                                                        onClick={subpreviousMonth}
                                                                        className="-my-1.5 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500"
                                                                    >
                                                                        <span className="sr-only">Previous month</span>
                                                                        <div className="w-5 h-5" aria-hidden="true">
                                                                            <ChevronLeftIcon />
                                                                        </div>
                                                                    </button>
                                                                    <button
                                                                        onClick={subnextMonth}
                                                                        type="button"
                                                                        className="-my-1.5 -mr-1.5 ml-2 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500"
                                                                    >
                                                                        <span className="sr-only">Next month</span>
                                                                        <div className="w-5 h-5" aria-hidden="true">
                                                                            <ChevronRightIcon />
                                                                        </div>
                                                                    </button>
                                                                </div>
                                                                {/* weekday div */}
                                                                <div className="grid grid-cols-7 mt-10 text-xs leading-2 text-center text-gray-500">
                                                                    <div>S</div>
                                                                    <div>M</div>
                                                                    <div>T</div>
                                                                    <div>W</div>
                                                                    <div>T</div>
                                                                    <div>F</div>
                                                                    <div>S</div>
                                                                </div>
                                                                {/* mini-calender day div */}
                                                                <div className="grid grid-cols-7 mt-2 text-sm">
                                                                    {YearOptiondays.length > 0 && YearOptiondays.map((day: Date, dayIdx: number) => (
                                                                        <div
                                                                            key={day.toString()}
                                                                            className={classNames(
                                                                                (dayIdx == 0 && colStartClasses[getDay(day)]),
                                                                                'py-1.5'
                                                                            )}
                                                                        >
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    setSelectedDaysub(day)
                                                                                    setReccOptions((prev: any) => ({ ...prev, specificDateOfYear: { month: getMonth(day), day: getDate(day) } }))
                                                                                }}
                                                                                className={classNames(
                                                                                    isEqual(day, selectedDaysub) && 'text-white',
                                                                                    !isEqual(day, selectedDaysub) &&
                                                                                    isToday(day) &&
                                                                                    'text-red-500',
                                                                                    !isEqual(day, selectedDaysub) &&
                                                                                    !isToday(day) &&
                                                                                    isSameMonth(day, firstDaySubCurrentMonth) &&
                                                                                    'text-gray-900',
                                                                                    !isEqual(day, selectedDaysub) &&
                                                                                    !isToday(day) &&
                                                                                    !isSameMonth(day, firstDaySubCurrentMonth) &&
                                                                                    'text-gray-400',
                                                                                    isEqual(day, selectedDaysub) && isToday(day) && 'bg-red-500',
                                                                                    // previewDates.has(day.toString()) && 'bg-gray-600',
                                                                                    isEqual(day, selectedDaysub) &&
                                                                                    !isToday(day) &&
                                                                                    'bg-gray-900',
                                                                                    !isEqual(day, selectedDaysub) && 'hover:bg-gray-200',
                                                                                    (isEqual(day, selectedDaysub) || isToday(day)) &&
                                                                                    'font-semibold',
                                                                                    'mx-auto flex h-8 w-8 items-center justify-center rounded-full'
                                                                                )}
                                                                            >
                                                                                <time dateTime={format(day, 'yyyy-MM-dd')}>
                                                                                    {format(day, 'd')}
                                                                                </time>
                                                                            </button>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>}
                                                            {variation == 'YonThe' &&
                                                                <div className={classNames(
                                                                    'flex   flex-col gap-y-2 w-full items-center  mt-2 justify-start h-fit min-h-2')}>
                                                                    {/* month selector  */}
                                                                    <div
                                                                        onMouseDown={() => {
                                                                            setDropDown((prev: any) => ({ ...prev, ['d5']: !prev['d5'] }))
                                                                        }}
                                                                        className=' relative flex flex-row w-fit mt-2  rounded-md ring-[1px] ring-black   items-center justify-between   px-2 gap-x-3 '>{months[(reccOptions?.nthWeekdayOfYear?.month) ?? 0].slice(0, 3)}
                                                                        <button
                                                                            type='button'
                                                                            className='flex w-fit text-[20px]'>
                                                                            {!dropdown['d5'] ? <ChevronRightIcon /> : <GoChevronDown />}
                                                                        </button>
                                                                        {dropdown['d5'] && (

                                                                            <ul className='absolute z-20 bg-white flex w-fit h-80 overflow-y-scroll scroll-smooth mb-2   pr-8 pl-2 left-0 rounded-md ring-1 ring-black bottom-full flex-col items-center justify-center '>
                                                                                {months.map((v, idx) => {
                                                                                    return <li
                                                                                        key={idx}
                                                                                        onMouseDown={() => {

                                                                                            setReccOptions((prev: any) => ({ ...prev, nthWeekdayOfYear: { ...prev.nthWeekdayOfYear, month: idx } }))

                                                                                        }}

                                                                                        className='flex flex-row items-center  justify-between w-full  hover:cursor-pointer hover:bg-gray-300 rounded-md text-start p-2 pl-2 '>{v}
                                                                                        <span className={reccOptions.nthWeekdayOfYear?.nth == idx + 1 ? 'flex text-blue-600' : 'hidden'}><TiTick /></span>
                                                                                    </li>

                                                                                })}

                                                                            </ul>
                                                                        )}
                                                                    </div>

                                                                    {/* nth & weekday */}
                                                                    <div className='flex mt-2 w-full mx-2 flex-row  justify-center gap-x-4 items-center p-1'>
                                                                        <div
                                                                            onMouseDown={() => {

                                                                                setDropDown((prev: any) => ({ ...prev, ['d3']: !prev['d3'] }))
                                                                            }}
                                                                            className=' relative flex flex-row w-fit  rounded-md ring-[1px] ring-black   items-center justify-between   px-2 gap-x-3 '>{(reccOptions?.nthWeekdayOfYear?.nth) ?? 1}
                                                                            <button
                                                                                type='button'
                                                                                className='flex w-fit text-[20px]'>
                                                                                {!dropdown['d3'] ? <ChevronRightIcon /> : <GoChevronDown />}
                                                                            </button>
                                                                            {dropdown['d3'] && (
                                                                                <ul className='absolute z-20 bg-white flex w-fit  pr-8 pl-2 left-0 rounded-md ring-1 ring-black top-full flex-col items-center justify-center '>
                                                                                    {['first', 'second', 'third', 'fourth', 'fifth'].map((v, idx) => {
                                                                                        return <li
                                                                                            key={idx}
                                                                                            onMouseDown={() => {

                                                                                                setReccOptions((prev: any) => ({ ...prev, nthWeekdayOfYear: { ...prev.nthWeekdayOfYear, nth: idx + 1 } }))

                                                                                            }}

                                                                                            className='flex flex-row items-center justify-between w-full  hover:cursor-pointer hover:bg-gray-300 rounded-md text-start p-2 pl-2 '>{v}
                                                                                            <span className={reccOptions.nthWeekdayOfYear?.nth == idx + 1 ? 'flex text-blue-600' : 'hidden'}><TiTick /></span>
                                                                                        </li>

                                                                                    })}

                                                                                </ul>
                                                                            )}
                                                                        </div>
                                                                        <div
                                                                            onMouseDown={() => {
                                                                                setDropDown((prev: any) => ({ ...prev, ['d4']: !prev['d4'] }));

                                                                            }}
                                                                            className=' relative flex flex-row w-fit rounded-md ring-[1px] ring-black    items-center justify-between   px-4 gap-x-2 '>{reccOptions?.nthWeekdayOfYear?.weekday}
                                                                            <button
                                                                                type='button'
                                                                                className='text-[20px]'>
                                                                                {!dropdown['d4'] ? <ChevronRightIcon /> : <GoChevronDown />}
                                                                            </button>
                                                                            {dropdown['d4'] && (
                                                                                <ul className='absolute z-20 bg-white flex w-fit  pr-8 pl-2 left-0 rounded-md ring-1 ring-black bottom-full flex-col items-center justify-center '>
                                                                                    {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((v, idx) => {
                                                                                        return <li
                                                                                            key={idx}
                                                                                            onMouseDown={() => {
                                                                                                setReccOptions((prev: any) => ({ ...prev, nthWeekdayOfYear: { ...prev.nthWeekdayOfYear, weekday: v } }))


                                                                                            }}
                                                                                            className='flex flex-row items-center justify-between w-full  hover:cursor-pointer hover:bg-gray-300 rounded-md text-start p-2 pl-2 '>{v}
                                                                                            <span className={reccOptions?.nthWeekdayOfYear?.weekday == v ? 'flex text-blue-600' : 'hidden'}><TiTick /></span>
                                                                                        </li>

                                                                                    })}

                                                                                </ul>
                                                                            )}

                                                                        </div>

                                                                    </div>

                                                                </div>}

                                                        </div>

                                                    default:
                                                        return <div>No Options Set</div>
                                                }
                                            })()

                                            }

                                        </div>

                                    </div>
                                    {/* ok and clear div  */}
                                    <div className='flex mt-2 flex-row gap-x-2 justify-between items-center p-1'>
                                        {/* cancel */}
                                        <button
                                            onMouseDown={() => {
                                                // custom open will be closed 
                                                // setReccOptions({});
                                                // setCustomOpen(!customOpen);
                                                setSelectedDay(today)

                                            }}
                                            className=' w-1/2 p-1 text-gray-700 rounded-md ring-1 hover:bg-blue-200 ring-black'>clear</button>
                                        <button
                                            onClick={() => {
                                                setCustomOpen(!customOpen);
                                            }}
                                            className='w-1/2 p-1 bg-blue-500 text-white rounded-md ring-1 ring-black'>Ok</button>

                                    </div>
                                </div>
                            )}
                        </div>
                        {/* cancel & ok div */}
                        <div className='flex mt-2 flex-row gap-x-2 justify-between items-center p-1'>
                            {/* cancel */}
                            <button
                                onClick={() => {
                                    setSelectedDay(today)
                                }}
                                className=' w-1/2 p-1 text-gray-700 rounded-md ring-1 hover:bg-blue-200 ring-black'>clear</button>
                            <button className='w-1/2 p-1 bg-blue-500 text-white rounded-md ring-1 ring-black'>Ok</button>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}



let colStartClasses = [
    '',
    'col-start-2',
    'col-start-3',
    'col-start-4',
    'col-start-5',
    'col-start-6',
    'col-start-7',
]
let dayofWeek = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
]
let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

