// Updated content of TableWidget.tsx after removing editing functionalities

import React from 'react';

const TableWidget = ({ data }) => {
    return (
        <div>
            <table>
                <thead>
                    <tr>
                        <th>Column 1</th>
                        <th>Column 2</th>
                        <th>Column 3</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, index) => (
                        <tr key={index}>
                            <td>{item.column1}</td>
                            <td>{item.column2}</td>
                            <td>{item.column3}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TableWidget;