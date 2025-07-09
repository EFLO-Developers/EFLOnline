<?php

class FactsController {

    public function GetCatFacts() {
        $catFacts = [
            [
                "fact" => "Cats can rotate their ears 180 degrees.",
                "used" => true,
                "createdAt" => "2017-09-27"
            ],
            [
                "fact" => "Cats and humans have nearly identical sections of the brain that control emotion.",
                "used" => true,
                "createdAt" => "2017-08-28"
            ],
            [
                "fact" => "The world's largest cat measured 48.5 inches long.",
                "used" => true,
                "createdAt" => "2017-03-20"
            ],
            [
                "fact" => "A cat was the Mayor of an Alaskan town for 20 years.",
                "used" => false,
                "createdAt" => "2017-06-05"
            ],
            [
                "fact" => "The oldest known pet cat existed 9,500 years ago.",
                "used" => true,
                "createdAt" => "2017-10-31"
            ],
            [
                "fact" => "Cats have whiskers on the backs of their front legs.",
                "used" => false,
                "createdAt" => "2018-01-15"
            ],
            [
                "fact" => "A cat’s purr may be a form of self-healing.",
                "used" => false,
                "createdAt" => "2018-07-23"
            ],
            [
                "fact" => "Cats have whiskers on the backs of their front legs.",
                "used" => false,
                "createdAt" => "2023-12-27"
            ],
            [
                "fact" => "Cats have whiskers on the backs of their front legs.",
                "used" => false,
                "createdAt" => "2023-07-05"
            ],
            [
                "fact" => "A cat’s purr may be a form of self-healing.",
                "used" => false,
                "createdAt" => "2024-09-05"
            ],
            [
                "fact" => "A house cat’s genome is 95.6 percent tiger.",
                "used" => false,
                "createdAt" => "2019-03-11"
            ],
            [
                "fact" => "Cats can make over 100 different sounds.",
                "used" => true,
                "createdAt" => "2022-11-14"
            ],
            [
                "fact" => "A cat’s brain is 90% similar to a human’s brain.",
                "used" => false,
                "createdAt" => "2021-05-22"
            ],
            [
                "fact" => "Cats sleep for 70% of their lives.",
                "used" => true,
                "createdAt" => "2020-08-30"
            ],
            [
                "fact" => "Cats have a third eyelid called a haw.",
                "used" => true,
                "createdAt" => "2023-04-18"
            ],
            [
                "fact" => "A cat can jump up to six times its length.",
                "used" => false,
                "createdAt" => "2024-10-08"
            ],
            [
                "fact" => "A cat’s purr may be a form of self-healing.",
                "used" => false,
                "createdAt" => "2018-07-23"
            ],
            [
                "fact" => "Cats have whiskers on the backs of their front legs.",
                "used" => false,
                "createdAt" => "2023-12-27"
            ],
            [
                "fact" => "Cats have whiskers on the backs of their front legs.",
                "used" => false,
                "createdAt" => "2023-07-05"
            ],
            [
                "fact" => "A cat’s purr may be a form of self-healing.",
                "used" => false,
                "createdAt" => "2024-09-05"
            ]
        ];

        header('Content-Type: application/json');
        echo json_encode($catFacts);

        exit; // Prevent any further output, including null;
    }

    public function GetSnailFacts() {
        $snailFacts = [
            [
                "fact" => "Snails can live in a variety of environments, including deserts and oceans.",
                "used" => false,
                "createdAt" => "2017-03-26"
            ],
            [
                "fact" => "Snails have thousands of microscopic teeth called radula.",
                "used" => false,
                "createdAt" => "2017-12-01"
            ],
            [
                "fact" => "Snails have a foot that they use to move around.",
                "used" => false,
                "createdAt" => "2018-01-13"
            ],
            [
                "fact" => "Snails can live in a variety of environments, including deserts and oceans.",
                "used" => true,
                "createdAt" => "2017-07-10"
            ],
            [
                "fact" => "A snail's shell is made of calcium carbonate.",
                "used" => true,
                "createdAt" => "2017-07-09"
            ],
            [
                "fact" => "Snails can sleep for up to three years.",
                "used" => true,
                "createdAt" => "2017-01-05"
            ],
            [
                "fact" => "Snails can retract their eyes if they sense danger.",
                "used" => false,
                "createdAt" => "2018-07-23"
            ],
            [
                "fact" => "Snails have a strong sense of smell and use it to find food.",
                "used" => false,
                "createdAt" => "2023-12-27"
            ],
            [
                "fact" => "Snails can regenerate lost body parts.",
                "used" => false,
                "createdAt" => "2023-07-05"
            ],
            [
                "fact" => "The average speed of a snail is 0.03 miles per hour.",
                "used" => false,
                "createdAt" => "2024-09-05"
            ],
            [
                "fact" => "Snails have a strong sense of smell and use it to find food.",
                "used" => false,
                "createdAt" => "2019-03-11"
            ],
            [
                "fact" => "Snails have a foot that they use to move around.",
                "used" => true,
                "createdAt" => "2022-11-14"
            ],
            [
                "fact" => "Snails can see but their vision is not very good.",
                "used" => false,
                "createdAt" => "2021-05-22"
            ],
            [
                "fact" => "Snails play an important role in the ecosystem by decomposing organic matter.",
                "used" => true,
                "createdAt" => "2020-08-30"
            ],
            [
                "fact" => "Snails have a heart with two chambers.",
                "used" => true,
                "createdAt" => "2023-04-18"
            ],
            [
                "fact" => "Snails are more active at night and during damp weather.",
                "used" => false,
                "createdAt" => "2024-10-08"
            ],
            [
                "fact" => "Snails can sleep for up to three years.",
                "used" => false,
                "createdAt" => "2018-07-23"
            ],
            [
                "fact" => "Snails have a strong sense of smell and use it to find food.",
                "used" => false,
                "createdAt" => "2023-12-27"
            ],
            [
                "fact" => "Snails can regenerate lost body parts.",
                "used" => false,
                "createdAt" => "2023-07-05"
            ],
            [
                "fact" => "The average speed of a snail is 0.03 miles per hour.",
                "used" => false,
                "createdAt" => "2024-09-05"
            ]
        ];

        header('Content-Type: application/json');
        echo json_encode($snailFacts);
        exit; // Prevent any further output, including null;
    }

}
?>