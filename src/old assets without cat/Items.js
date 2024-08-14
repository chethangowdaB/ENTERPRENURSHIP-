import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Itempic from '../Components/itempic1';
import '../styles/stylesheetforpro.css';

class Items extends Component {
  static propTypes = {
    projects: PropTypes.array, // Ensure projects is an array
    email: PropTypes.string.isRequired
  };

  static defaultProps = {
    projects: [] // Default to an empty array if not provided
  };

  render() {
    const { projects, email } = this.props;

    // Debugging
    console.log('Projects:', projects);

    return (
      <div className='itemgrid'>
        {Array.isArray(projects) && projects.map((itempi, index) => (
          <Itempic key={index} itempi={itempi} email={email} />
        ))}
      </div>
    );
  }
}

export default Items;
