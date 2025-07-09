


//EXAMPLE ONLY 
export const createPlayer = async (req, res) => {
    try {
      const { player } = req.body; // Extract the player object from the request body
  
      if (player && player.playerId && player.playername) {
        // Perform your logic here, e.g., save the player to the database
        console.log('Player:', player);
  
        res.status(201).json({ message: 'Player created successfully', player });
      } else {
        res.status(400).json({ error: 'Invalid player object' });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Failed to create player' });
    }
  };